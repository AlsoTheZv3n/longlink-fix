from factories import create_organization
from sqlalchemy import text
from src.database.session import session_scope
from src.database.models.users import User
from src.database.models.registries import RegistryConnection


async def test_registry_credential_is_encrypted_and_excluded_from_repr(users: tuple[User, User, User]) -> None:
    """Keep provider tokens private both at rest and in diagnostic representations."""

    # Arrange
    owner, _, _ = users
    organization = await create_organization(owner)
    connection = RegistryConnection(organization_id=organization.id, username="acme", credential="private-provider-token")

    # Act
    async with session_scope() as session:
        session.add(connection)
        await session.commit()
    async with session_scope() as session:
        stored = await session.scalar(text("SELECT credential FROM registry_connections"))
        restored = await session.get(RegistryConnection, connection.id)

    # Assert
    assert "private-provider-token" not in repr(connection)
    assert "private-provider-token" not in stored
    assert restored is not None
    assert restored.credential == "private-provider-token"
