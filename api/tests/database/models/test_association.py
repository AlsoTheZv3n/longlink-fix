import pytest
from factories import create_organization
from sqlalchemy.exc import IntegrityError
from src.models.roles import OrganizationRoles
from src.database.session import session_scope
from src.database.models.users import User
from src.database.models.association import UserOrganization


async def test_membership_is_unique_per_user_and_organization(users: tuple[User, User, User]) -> None:
    """Prevent conflicting roles for the same tenant membership."""

    # Arrange
    owner, _, _ = users
    organization = await create_organization(owner)

    # Act / Assert
    async with session_scope() as session:
        session.add(UserOrganization(user_id=owner.id, organization_id=organization.id, role=OrganizationRoles.read))
        with pytest.raises(IntegrityError):
            await session.flush()
