from io import StringIO
from alembic import command
from longlink.shared import migrations as shared_migrations


def test_initial_shared_migration_downgrade_drops_only_audit_table() -> None:
    """Remove only the SDK-owned audit table when downgrading the shared schema."""

    # Arrange
    output = StringIO()
    config = shared_migrations.migration_config("postgresql+asyncpg://db/organization")
    config.output_buffer = output

    # Act
    command.downgrade(config, "20260713_0001:base", sql=True)

    # Assert
    sql = output.getvalue()
    assert [line for line in sql.splitlines() if line.startswith("DROP TABLE ")] == ["DROP TABLE audit;"]
    assert "DROP SCHEMA" not in sql
