from io import StringIO
from alembic import command
from longlink.shared import migrations


def test_profile_migration_removes_legacy_fields_without_dropping_user_profiles() -> None:
    """Preserve shared identities while removing obsolete projection columns."""

    # Arrange
    output = StringIO()
    config = migrations.migration_config("postgresql+asyncpg://db/organization")
    config.output_buffer = output

    # Act
    command.upgrade(config, "20260713_0001:head", sql=True)

    # Assert
    sql = output.getvalue()
    assert "DROP COLUMN role" in sql
    assert "DROP COLUMN created_at" in sql
    assert "DROP COLUMN updated_at" in sql
    assert "DROP COLUMN deleted_at" in sql
    assert "DROP TABLE audit" not in sql
