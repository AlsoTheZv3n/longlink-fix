import pytest
import pytest_asyncio
from uuid import UUID
from sqlalchemy import text
from collections.abc import AsyncIterator
from longlink.shared import audit as shared_audit
from longlink.shared import migrations as shared_migrations
from sqlalchemy.engine import URL
from sqlalchemy.ext.asyncio import AsyncEngine, create_async_engine


@pytest.fixture
def audit_user() -> dict[str, UUID | str]:
    """Create one representative shared-audit user snapshot."""

    # Include every authoritative profile field supplied by the Platform projection.
    return {
        "id": UUID("00000000-0000-0000-0000-000000000001"),
        "name": "Owner User",
        "email": "owner@example.com",
        "avatar": "",
    }


@pytest_asyncio.fixture
async def postgres_engine(postgresql_url: URL) -> AsyncIterator[AsyncEngine]:
    """Provide one disposable PostgreSQL engine for a shared migration integration test."""

    engine = create_async_engine(postgresql_url)
    try:
        yield engine
    finally:
        await engine.dispose()


def test_migration_config_rejects_non_async_postgresql_urls() -> None:
    """Reject shared migration URLs without a supported async PostgreSQL driver."""

    # Act and assert
    with pytest.raises(ValueError, match="Shared migrations require an async PostgreSQL database URL"):
        shared_migrations.migration_config("postgresql://db/longlink")


def test_migration_config_preserves_percent_encoded_credentials() -> None:
    """Build a usable Alembic configuration for a valid asyncpg URL."""

    # Arrange
    database_url = "postgresql+asyncpg://control:se%25cret@db/longlink"

    # Act
    config = shared_migrations.migration_config(database_url)

    # Assert
    script_location = config.get_main_option("script_location")
    assert script_location is not None
    assert script_location.endswith("longlink/shared/alembic")
    assert config.get_main_option("sqlalchemy.url") == database_url


def test_migration_config_rejects_missing_packaged_resources(tmp_path, monkeypatch: pytest.MonkeyPatch) -> None:
    """Reject SDK installations that omit shared Alembic resources."""

    # Arrange
    monkeypatch.setattr(shared_migrations, "files", lambda _package: tmp_path)

    # Act and assert
    with pytest.raises(RuntimeError, match="could not be located"):
        shared_migrations.migration_config("postgresql+asyncpg://control:secret@db/longlink")


@pytest.mark.integration
async def test_shared_migrations_isolate_schema_and_sync_user_profiles(
    postgresql_url: URL,
    postgres_engine: AsyncEngine,
    audit_user: dict[str, UUID | str],
) -> None:
    """Migrate into the isolated shared schema and synchronize one changing user profile."""

    # Make a Solution schema the role default to prove migrations override it.
    async with postgres_engine.begin() as connection:
        await connection.execute(text("CREATE SCHEMA solution"))
        await connection.execute(
            text(f"ALTER ROLE {postgresql_url.username} IN DATABASE {postgresql_url.database} SET search_path = solution, public")
        )

    # Exercise migration idempotency through the SDK-owned async entrypoint.
    await shared_migrations.migrate_database(postgresql_url)
    await shared_migrations.migrate_database(postgresql_url)

    # Verify both SDK-owned tables exist only in the shared schema.
    async with postgres_engine.begin() as connection:
        result = await connection.execute(
            text(
                """
                SELECT table_schema, table_name
                FROM information_schema.tables
                WHERE table_name IN ('audit', 'alembic_version')
                """
            )
        )
        table_locations = set(result.tuples())
    assert table_locations == {("shared", "audit"), ("shared", "alembic_version")}

    # Insert one active control-plane user through the public synchronization entrypoint.
    user_id = audit_user["id"]
    async with postgres_engine.begin() as connection:
        await connection.execute(text("SET LOCAL search_path TO shared"))
        await shared_audit.sync(connection, [audit_user])

    # Upsert changed mutable profile fields.
    updated_user = {
        **audit_user,
        "name": "Updated User",
        "email": "updated@example.com",
        "avatar": "https://example.com/avatar.png",
    }
    async with postgres_engine.begin() as connection:
        await connection.execute(text("SET LOCAL search_path TO shared"))
        await shared_audit.sync(connection, [updated_user])

    # Read the persisted row from its qualified shared table and verify no duplicate was created.
    async with postgres_engine.connect() as connection:
        result = await connection.execute(
            text(
                """
                SELECT id, name, email, avatar
                FROM shared.audit
                WHERE id = :user_id
                """
            ),
            {"user_id": user_id},
        )
        row = result.mappings().one()
        count_result = await connection.execute(text("SELECT count(*) FROM shared.audit"))
        row_count = count_result.scalar_one()

    assert row_count == 1
    assert dict(row) == {
        "id": user_id,
        "name": "Updated User",
        "email": "updated@example.com",
        "avatar": "https://example.com/avatar.png",
    }
