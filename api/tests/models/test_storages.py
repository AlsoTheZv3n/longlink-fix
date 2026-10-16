import pytest
from pydantic import ValidationError
from src.models.storages import OrganizationStorageUsageResponse

pytestmark = pytest.mark.no_db


@pytest.mark.parametrize("field", ["space_used", "quota_bytes"])
def test_storage_usage_rejects_negative_bytes(field: str) -> None:
    """Do not publish impossible object usage or capacity."""

    # Arrange
    payload = {"space_used": 0, "quota_bytes": 0, field: -1}

    # Act / Assert
    with pytest.raises(ValidationError, match=field):
        OrganizationStorageUsageResponse.model_validate(payload)
