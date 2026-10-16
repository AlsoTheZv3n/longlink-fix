import pytest
from pydantic import JsonValue
from sqlalchemy.engine import Dialect
from src.database.types import EncryptedType
from sqlalchemy.dialects import sqlite, postgresql

pytestmark = pytest.mark.no_db


@pytest.mark.parametrize("dialect", [sqlite.dialect(), postgresql.dialect()])
@pytest.mark.parametrize("value", [None, "credential", {"password": "secret", "options": [True, 3]}])
def test_credentials_round_trip_without_plaintext(dialect: Dialect, value: JsonValue) -> None:
    """Keep credential encoding portable across development and production databases."""

    # Arrange
    column = EncryptedType("test-encryption-key")

    # Act
    stored = column.process_bind_param(value, dialect)
    restored = column.process_result_value(stored, dialect)

    # Assert
    assert restored == value
    assert stored is None or "credential" not in stored and "secret" not in stored
