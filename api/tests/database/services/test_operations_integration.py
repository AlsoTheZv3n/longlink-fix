import pytest
import asyncio
from uuid import UUID, uuid4
from sqlmodel import col
from factories import claim_operation, queue_operation
from sqlalchemy import Select, select
from src.database import session as database_session
from sqlalchemy.engine import URL
from src.database.services import operations
from src.models.operations import OperationKind, OperationStatus
from sqlalchemy.ext.asyncio import async_sessionmaker, create_async_engine
from src.database.models.users import User
from src.database.models.operations import Operation

pytestmark = [pytest.mark.integration, pytest.mark.no_db]


@pytest.mark.parametrize("backend", ["postgresql", "mysql"])
async def test_claim_globally_leases_one_operation_to_one_concurrent_worker(
    monkeypatch: pytest.MonkeyPatch, backend: str, request: pytest.FixtureRequest
) -> None:
    """Coalesce sequential work while safely consuming duplicates across database workers."""

    # Request only the selected backend and connect to its fresh database asynchronously.
    if backend == "postgresql":
        database_url: URL = request.getfixturevalue("postgres_url")
        database_url = database_url.set(drivername="postgresql+asyncpg")
    else:
        database_url = request.getfixturevalue("mysql_url")
        database_url = database_url.set(drivername="mysql+aiomysql")
    engine = create_async_engine(database_url, isolation_level="READ COMMITTED")
    try:
        # Create the queue and its audit-user dependency before binding the production session service.
        async with engine.begin() as connection:
            await connection.run_sync(User.__table__.create)
            await connection.run_sync(Operation.__table__.create)

        session_factory = async_sessionmaker(engine, expire_on_commit=False)
        monkeypatch.setattr(database_session, "Session", session_factory)

        # Sequential enqueue coalesces; direct insertion deterministically models a best-effort race.
        target_id = uuid4()
        first = await queue_operation(kind=OperationKind.solution_delete, target_id=target_id)
        coalesced = await queue_operation(kind=first.kind, target_id=target_id)
        assert coalesced.id == first.id
        duplicate = Operation(kind=first.kind, target_id=target_id)
        async with session_factory() as session:
            session.add(duplicate)
            await session.commit()

        # Hold both real initial reads before either worker can attempt its guarded UPDATE.
        barrier = asyncio.Barrier(2)
        read_ids: list[UUID] = []

        async def claim_after_shared_read() -> Operation | None:
            """Force independent workers to race from the same persisted unleased row."""

            async with session_factory() as session:
                scalar = session.scalar

                async def read(statement: Select[tuple[Operation]]) -> Operation | None:
                    """Suspend only after the real queue lookup has returned."""

                    operation = await scalar(statement)
                    assert operation is not None
                    assert operation.lease_expires_at is None
                    read_ids.append(operation.id)
                    async with asyncio.timeout(5):
                        await barrier.wait()
                    assert operation.id == read_ids[0]
                    return operation

                # Restore the read seam before commit and all later lifecycle assertions.
                with monkeypatch.context() as reads:
                    reads.setattr(session, "scalar", read)
                    operation = await operations.claim(session)
                await session.commit()
                return operation

        # Act with bounded execution and guaranteed cleanup of both worker sessions.
        workers = [asyncio.create_task(claim_after_shared_read()), asyncio.create_task(claim_after_shared_read())]
        try:
            async with asyncio.timeout(10):
                claims = await asyncio.gather(*workers)
        finally:
            for worker in workers:
                worker.cancel()
            async with asyncio.timeout(5):
                await asyncio.gather(*workers, return_exceptions=True)
        claimed = [claim for claim in claims if claim is not None]

        # Assert one winner both in the returned claims and in committed database state.
        assert len(claimed) == 1
        assert claimed[0].status == OperationStatus.active
        assert claimed[0].lease_expires_at is not None
        async with session_factory() as session:
            result = await session.scalars(select(Operation).where(col(Operation.lease_expires_at).is_not(None)))
            [active] = result.all()
            assert active.id == claimed[0].id
            assert active.status == OperationStatus.active
        assert await claim_operation() is None

        # Releasing work remains safe with multiple unfinished rows for the same target.
        async with session_factory() as session:
            assert await operations.release(session, claimed[0].id) is True

            # Read the persisted lease state after the guarded transition.
            released = await session.get(Operation, claimed[0].id, populate_existing=True)
            assert released is not None
            assert released.status == OperationStatus.scheduled
            assert released.lease_expires_at is None
            assert released.finished_at is None
            await session.commit()

        # Complete released work and verify persisted state reflects the guarded update.
        resumed = await claim_operation()
        assert resumed is not None
        assert resumed.id == claimed[0].id
        async with session_factory() as session:
            assert await operations.complete(session, resumed.id) is True

            # Read the persisted completion after the guarded transition.
            completed = await session.get(Operation, resumed.id, populate_existing=True)
            assert completed is not None
            assert completed.status == OperationStatus.completed
            assert completed.lease_expires_at is None
            assert completed.finished_at is not None
            await session.commit()

        # Fail the remaining duplicate and verify the queue has no unfinished work.
        remaining = await claim_operation()
        assert remaining is not None
        assert {completed.id, remaining.id} == {first.id, duplicate.id}
        async with session_factory() as session:
            assert await operations.fail(session, remaining.id, "worker failed") is True

            # Read the persisted failure after the guarded transition.
            failed = await session.get(Operation, remaining.id, populate_existing=True)
            assert failed is not None
            assert failed.status == OperationStatus.failed
            assert failed.failed == "worker failed"
            assert failed.lease_expires_at is None
            assert failed.finished_at is not None
            await session.commit()

        assert await claim_operation() is None
        async with session_factory() as session:
            unfinished = await session.scalar(select(Operation).where(col(Operation.finished_at).is_(None)))
            assert unfinished is None
    finally:
        # Dispose database connections before the fixture removes the database.
        await engine.dispose()
