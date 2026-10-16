import pytest
from longlink.database import urls as database_urls

DRIVER_SETTINGS = [
    pytest.param("sqlite+aiosqlite:///:memory:", None, {}, id="sqlite"),
    pytest.param(
        "postgresql+asyncpg://solution:secret@db/longlink", None, {"server_settings": {"timezone": "UTC"}}, id="postgresql-defaults"
    ),
]


@pytest.mark.parametrize(("database_url", "schema", "expected"), DRIVER_SETTINGS)
def test_connect_args_returns_driver_specific_settings(database_url: str, schema: str | None, expected: dict[str, object]) -> None:
    """Return only the connection settings supported by each database driver."""

    # Act
    result = database_urls.connect_args(database_url, schema=schema)

    # Assert
    assert result == expected
