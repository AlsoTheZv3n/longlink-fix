import pytest
from src.models.metadata import LongLinkMetadata

pytestmark = pytest.mark.no_db


def test_image_metadata_retains_environment_requirements() -> None:
    """Keep required secrets and their descriptions in the image discovery contract."""

    # Arrange
    payload = {
        "image": "ghcr.io/acme/dashboard@sha256:abc123",
        "version": "1.2.3",
        "environments": [{"name": "API_KEY", "required": True, "description": "Provider credential"}],
    }

    # Act
    metadata = LongLinkMetadata.model_validate(payload)

    # Assert
    assert metadata.model_dump(mode="json", exclude_none=True) == payload
