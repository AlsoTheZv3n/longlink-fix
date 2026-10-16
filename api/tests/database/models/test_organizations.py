from factories import create_organization
from sqlalchemy import text
from src.database.session import session_scope
from src.database.models.users import User
from src.database.models.organizations import Organization


async def test_organization_database_password_is_encrypted(users: tuple[User, User, User]) -> None:
    """Recover private database credentials without storing them as plaintext."""

    # Arrange
    owner, _, _ = users
    organization = await create_organization(owner)

    # Act
    async with session_scope() as session:
        stored = await session.scalar(text("SELECT database_password FROM organizations"))
        restored = await session.get(Organization, organization.id)

    # Assert
    assert stored != organization.database_password
    assert restored is not None
    assert restored.database_password == organization.database_password
