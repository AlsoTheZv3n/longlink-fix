import pytest
from uuid import UUID
from typing import cast
from sqlalchemy import text
from sqlalchemy.exc import DBAPIError
from longlink.shared import audit as shared_audit
from sqlalchemy.ext.asyncio import AsyncConnection, create_async_engine


async def test_empty_shared_audit_sync_does_not_execute_sql() -> None:
    """Treat empty shared audit synchronization as a no-op on the supplied connection."""

    # Empty payloads return before synchronization needs a connection.
    conn = cast(AsyncConnection, object())
    await shared_audit.sync(conn, [])


async def test_shared_audit_sync_leaves_cleanup_to_caller_when_upsert_fails() -> None:
    """Propagate SQL failures while leaving connection and transaction ownership with the caller."""

    # Missing shared tables cause a real SQL failure within a caller-owned transaction.
    user = {"id": UUID(int=1), "name": "Owner User", "email": "owner@example.com", "avatar": ""}
    engine = create_async_engine("sqlite+aiosqlite://")
    try:
        async with engine.connect() as conn:
            # Keep the transaction active while the failing sync unwinds through finally.
            with pytest.raises(DBAPIError, match="no such table: audit"):  # noqa: PT012
                async with conn.begin():
                    try:
                        await shared_audit.sync(conn, [user])
                    finally:
                        assert not conn.closed
                        assert conn.in_transaction()

            # The caller's transaction context rolls back and leaves its connection usable.
            assert not conn.in_transaction()
            assert await conn.scalar(text("SELECT 1")) == 1
    finally:
        await engine.dispose()
