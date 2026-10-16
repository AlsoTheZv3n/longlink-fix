import pytest
from uuid import uuid4
from src.models.registries import RegistryCreate, RegistryResponse
from src.database.models.registries import RegistryConnection

pytestmark = pytest.mark.no_db


def test_registry_response_never_serializes_credential() -> None:
    """Keep credentials write-only when serializing persisted connections."""

    # Arrange
    request = RegistryCreate(credential="private-github-token")
    connection = RegistryConnection(organization_id=uuid4(), username="acme", credential=request.credential.get_secret_value())

    # Act
    response = RegistryResponse.model_validate(connection)

    # Assert
    assert response.model_dump(mode="json") == {"id": str(connection.id), "host": "ghcr.io", "provider": "ghcr", "username": "acme"}
