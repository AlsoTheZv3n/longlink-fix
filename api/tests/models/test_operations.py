import pytest
from uuid import uuid4
from datetime import UTC, datetime
from src.models.operations import OperationResponse

pytestmark = pytest.mark.no_db


def test_operation_response_preserves_public_kind_and_failure() -> None:
    """Expose dotted handler names and terminal failure details to administrators."""

    # Arrange
    payload = {
        "id": str(uuid4()),
        "kind": "solution.deploy",
        "target_id": str(uuid4()),
        "resource_name": "Dashboard",
        "status": "failed",
        "failed": "Image unavailable",
        "created_at": datetime.now(UTC).isoformat(),
        "finished_at": None,
    }

    # Act
    operation = OperationResponse.model_validate(payload)

    # Assert
    response = operation.model_dump(mode="json")
    assert response["kind"] == "solution.deploy"
    assert response["status"] == "failed"
    assert response["failed"] == "Image unavailable"
