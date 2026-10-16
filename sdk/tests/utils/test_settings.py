import pytest
from longlink.utils.settings import Envs


@pytest.mark.parametrize("database_schema", ["solution-schema", "public; DROP SCHEMA shared", '"solution"'])
def test_production_settings_reject_invalid_database_schema(database_schema: str, production_settings: dict[str, str | int]) -> None:
    """Reject production database schemas that are not PostgreSQL identifiers."""

    # Arrange
    settings = production_settings | {"DATABASE_SCHEMA": database_schema}

    # Act and assert
    with pytest.raises(ValueError, match="DATABASE_SCHEMA must be a valid PostgreSQL identifier"):
        Envs.model_validate(settings)
