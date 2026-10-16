import asyncio
import contextlib
from uuid import UUID
from datetime import UTC, datetime, timedelta
from sqlmodel import col
from src.utils import postgres
from sqlalchemy import text, delete, select, update
from src.errors import ForbiddenError
from dataclasses import dataclass
from src.kubernetes import databases as database_resources
from collections.abc import AsyncGenerator
from longlink.shared import audit as shared_audit
from src.models.statuses import Status
from src.database.session import session_scope
from src.database.services import organizations
from src.kubernetes.client import Kubernetes
from sqlalchemy.ext.asyncio import AsyncSession
from src.models.organizations import DatabaseState
from src.database.models.users import User
from src.database.models.computes import ComputeRegistry
from src.database.models.association import UserOrganization
from src.database.models.organizations import Organization, OrganizationActivity

LEASE_SECONDS = 180
RENEW_SECONDS = 30


async def lock(session: AsyncSession, organization_id: UUID) -> Organization | None:
    """Serialize admission and transitions on SQLite, PostgreSQL, and MySQL."""

    # An UPDATE takes a write lock even where SELECT FOR UPDATE is unsupported.
    await session.execute(
        update(Organization).where(col(Organization.id) == organization_id).values(updated_at=col(Organization.updated_at))
    )
    return await session.get(Organization, organization_id, populate_existing=True)


async def _project_users(session: AsyncSession, organization_id: UUID, db: postgres.Postgres) -> None:
    """Project a Platform snapshot while runtime coordination owns synchronization."""

    # Load every authoritative membership for the Organization database snapshot.
    statement = (
        select(col(User.id), col(User.name), col(User.email), col(User.avatar))
        .join(UserOrganization, col(UserOrganization.user_id) == col(User.id))
        .where(col(UserOrganization.organization_id) == organization_id)
    )
    result = await session.execute(statement)
    rows = result.mappings().all()

    # Empty snapshots must not open an Organization database connection.
    if not rows:
        return

    # The Platform owns the transaction for its authoritative Organization user projection.
    async with db.connection(organization_id.hex, search_path="shared") as conn:
        await shared_audit.sync(conn, rows)


@dataclass
class Lease:
    """Fence an exclusive transition using its last committed expiry as an ownership token."""

    organization_id: UUID
    expires_at: datetime
    lost: bool = False

    async def owned(self, session: AsyncSession) -> bool:
        """Check ownership after the caller locks the Organization."""

        # Expired workers cannot publish results or renew a replacement worker's lease.
        row = await session.get(OrganizationActivity, self.organization_id, populate_existing=True)
        return row is not None and row.expires_at == self.expires_at and row.expires_at > datetime.now(UTC)

    async def check(self) -> None:
        """Reject stale transition workers immediately before external operations."""

        # Release the admission lock before external I/O; Kubernetes still needs its own strict fencing.
        async with session_scope() as session:
            organization = await lock(session, self.organization_id)
            if organization is None or organization.deleted_at is not None or self.lost or not await self.owned(session):
                raise RuntimeError("Organization transition lease was lost")

    @contextlib.asynccontextmanager
    async def maintain(self) -> AsyncGenerator[None]:
        """Renew a lease and interrupt its work if persistence or ownership is lost."""

        # Associate lease loss with the operation task that owns this maintenance scope.
        if self.lost or self.expires_at <= datetime.now(UTC):
            raise RuntimeError("Organization activity lease was lost")
        task = asyncio.current_task()
        if task is None:
            raise RuntimeError("Organization activity requires an asynchronous task")

        async def renew() -> None:
            """Extend the lease only while this worker still owns it."""

            try:
                while True:
                    await asyncio.sleep(RENEW_SECONDS)
                    async with asyncio.timeout(RENEW_SECONDS), session_scope() as session:
                        await lock(session, self.organization_id)
                        if not await self.owned(session):
                            raise RuntimeError("Organization activity lease was lost")
                        expires_at = datetime.now(UTC).replace(microsecond=0) + timedelta(seconds=LEASE_SECONDS)
                        await session.execute(
                            update(OrganizationActivity)
                            .where(col(OrganizationActivity.organization_id) == self.organization_id)
                            .values(expires_at=expires_at)
                        )
                        self.expires_at = expires_at
                        await session.commit()
            except Exception:
                self.lost = True
                if not task.done():
                    task.cancel()
                raise

        renewal = asyncio.create_task(renew())
        try:
            yield
        finally:
            try:
                renewal.cancel()
                with contextlib.suppress(asyncio.CancelledError):
                    await renewal
            finally:
                # Conditional release cannot delete a replacement lease after crash recovery.
                async with session_scope() as session:
                    organization = await lock(session, self.organization_id)
                    if organization is not None and await self.owned(session):
                        await session.execute(
                            delete(OrganizationActivity).where(col(OrganizationActivity.organization_id) == self.organization_id)
                        )
                    await session.commit()


async def _claim(session: AsyncSession, organization_id: UUID) -> Lease | None:
    """Claim the exclusive transition lease after the caller locks its Organization."""

    # The Organization UUID reserves one lease slot for exclusive database transitions.
    now = datetime.now(UTC)
    await session.execute(
        delete(OrganizationActivity).where(
            col(OrganizationActivity.organization_id) == organization_id,
            col(OrganizationActivity.expires_at) <= now,
        )
    )
    if await session.get(OrganizationActivity, organization_id) is not None:
        return None
    row = OrganizationActivity(organization_id=organization_id, expires_at=now.replace(microsecond=0) + timedelta(seconds=LEASE_SECONDS))
    session.add(row)
    await session.flush()
    return Lease(organization_id, row.expires_at)


@contextlib.asynccontextmanager
async def deleting(organization_id: UUID) -> AsyncGenerator[None]:
    """Drain admitted work and fence database transitions during destructive cleanup."""

    # Serialize deletion eligibility and lease admission under the same Organization lock.
    while True:
        async with session_scope() as session:
            organization = await lock(session, organization_id)
            if organization is None:
                break
            if organization.deleted_at is None:
                raise ForbiddenError("Active Organizations cannot be deleted by lifecycle cleanup")
            lease = await _claim(session, organization_id)
            await session.commit()
        if lease is not None:
            async with lease.maintain():
                yield
            return
        await asyncio.sleep(0.5)
    yield


async def sync_users(user_id: UUID) -> None:
    """Synchronize a user's Organization profiles in place after Platform changes commit."""

    # Resolve active memberships without holding a request transaction during database provisioning.
    async with session_scope() as session:
        result = await session.scalars(
            select(col(UserOrganization.organization_id))
            .join(Organization, col(Organization.id) == col(UserOrganization.organization_id))
            .where(col(UserOrganization.user_id) == user_id, col(Organization.deleted_at).is_(None))
        )
        organization_ids = result.all()

    # Wait for the shared schema before refreshing each Organization's user snapshot.
    for organization_id in organization_ids:
        if not await ready(organization_id):
            continue

        # Serialize snapshots with concurrent syncs and deletion, then read fresh committed profiles.
        async with session_scope() as session:
            organization = await lock(session, organization_id)
            if organization is None or organization.deleted_at is not None:
                continue

            # Load the assigned Compute only while the Organization remains locked and active.
            target = await organizations.database_infrastructure(session, organization_id)
            if target is None:
                continue
            organization, compute = target
            cluster = Kubernetes(
                compute.kubeconfig,
            )

            # Upsert shared profiles without removing records referenced by historical Solution audits.
            async with cluster:
                database = await database_resources.connection(organization, cluster)
                await _project_users(session, organization_id, database)
            await session.commit()


async def ready(organization_id: UUID) -> bool:
    """Provision the database and shared projection behind one persisted transition lease."""

    while True:
        # Provisioning decisions share the same short write transaction.
        async with session_scope() as session:
            organization = await lock(session, organization_id)
            if organization is None or organization.deleted_at is not None:
                return False
            transition = await session.get(OrganizationActivity, organization_id)
            if organization.database_state == DatabaseState.available and (
                transition is None or transition.expires_at <= datetime.now(UTC)
            ):
                return True
            lease = await _claim(session, organization_id)
            await session.commit()
        if lease is None:
            await asyncio.sleep(0.5)
            continue

        async with lease.maintain():
            try:
                # Load only the database assignment without decrypting unrelated storage credentials.
                async with session_scope() as session:
                    result = await session.execute(
                        select(Organization, col(ComputeRegistry.kubeconfig), col(ComputeRegistry.database_storage_class))
                        .join(ComputeRegistry, col(ComputeRegistry.id) == col(Organization.compute_id))
                        .where(col(Organization.id) == organization_id)
                    )
                    target = result.tuples().one_or_none()
                if target is None:
                    raise RuntimeError("Organization is unavailable")
                organization, kubeconfig, database_storage_class = target
                cluster = Kubernetes(kubeconfig)
                async with cluster:
                    await lease.check()
                    if organization.status != Status.running:
                        await database_resources.apply(
                            cluster,
                            organization_id,
                            organization.database_password,
                            database_storage_class,
                            size_mib=organization.database_size_mib,
                            instances=organization.database_instances,
                        )
                    else:
                        # Reassert the desired annotation even after an expired worker's interrupted sleep.
                        await database_resources.resume(cluster, organization_id)
                    database = await database_resources.connection(organization, cluster)
                    if organization.status != Status.running:
                        await lease.check()
                        await database.prepare_organization_database(organization_id)

                    # Verify ownership before taking the snapshot; the publish gate rechecks shared state.
                    await lease.check()
                    async with session_scope() as session:
                        await _project_users(session, organization_id, database)

                    # Empty snapshots skip SQL; verify the tenant connection immediately before publication.
                    async with asyncio.timeout(10), database.connection(organization_id.hex) as sql:
                        await sql.execute(text("SELECT 1"))

                    # Publish the provisioned database and its shared projection.
                    async with session_scope() as session:
                        organization = await lock(session, organization_id)
                        if organization is None or organization.deleted_at is not None or not await lease.owned(session):
                            raise RuntimeError("Organization transition lease was lost")
                        organization.database_state = DatabaseState.available
                        await session.commit()
                        return True
            except BaseException:
                # An interrupted snapshot is retried through the failed state.
                async with session_scope() as session:
                    organization = await lock(session, organization_id)
                    if organization is not None and await lease.owned(session):
                        organization.database_state = DatabaseState.failed
                    await session.commit()
                raise
