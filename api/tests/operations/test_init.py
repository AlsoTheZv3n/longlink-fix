import pytest
from src import operations
from src.models.operations import OperationKind

pytestmark = pytest.mark.no_db


def test_every_operation_kind_has_an_executable_handler() -> None:
    """Keep durable queued work dispatchable when new operation kinds are introduced."""

    # Assert
    assert set(operations.handlers) == set(OperationKind)
    assert all(callable(handler) for handler in operations.handlers.values())
