import pytest
from io import StringIO
from alembic import command
from longlink.shared import migrations as shared_migrations


def test_shared_migration_environment_emits_offline_schema_bootstrap() -> None:
    """Emit shared-schema bootstrap SQL before offline migration output."""

    # Arrange
    output = StringIO()
    config = shared_migrations.migration_config("postgresql+asyncpg://db/organization")
    config.output_buffer = output

    # Act
    command.upgrade(config, "head", sql=True)

    # Assert
    sql = output.getvalue()
    assert (
        sql.index("CREATE SCHEMA IF NOT EXISTS shared")
        < sql.index("SET search_path TO shared")
        < sql.index("CREATE TABLE shared.alembic_version")
        < sql.index("CREATE TABLE audit")
    )


def test_shared_migration_environment_rejects_missing_online_connection() -> None:
    """Require the async migration runner to supply its owned connection."""

    # Arrange
    config = shared_migrations.migration_config("postgresql+asyncpg://db/organization")

    # Act and assert
    with pytest.raises(RuntimeError, match="Online shared migrations require a supplied SQLAlchemy Connection"):
        command.upgrade(config, "head")
