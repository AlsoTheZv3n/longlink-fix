import pytest
from uuid import uuid4
from datetime import UTC, datetime, timedelta
from src.models.operations import OperationKind, OperationStatus
from src.database.models.operations import Operation

pytestmark = pytest.mark.no_db

OPERATION_STATES = [
    (False, None, None, OperationStatus.scheduled),
    (False, None, -60, OperationStatus.scheduled),
    (False, None, 60, OperationStatus.active),
    (True, None, 60, OperationStatus.completed),
    (True, "Failed", 60, OperationStatus.failed),
]


@pytest.mark.parametrize(("finished", "failed", "lease_seconds", "expected"), OPERATION_STATES)
def test_operation_status_prioritizes_terminal_outcome(
    finished: bool, failed: str | None, lease_seconds: int | None, expected: OperationStatus
) -> None:
    """Do not let a remaining lease hide a committed outcome or revive expired work."""

    # Arrange
    now = datetime.now(UTC)
    operation = Operation(
        kind=OperationKind.solution_deploy,
        target_id=uuid4(),
        failed=failed,
        finished_at=now if finished else None,
        lease_expires_at=now + timedelta(seconds=lease_seconds) if lease_seconds is not None else None,
    )

    # Act / Assert
    assert operation.status == expected
