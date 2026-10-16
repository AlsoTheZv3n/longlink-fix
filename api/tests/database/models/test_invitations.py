import pytest
from factories import create_organization
from sqlalchemy.exc import IntegrityError
from src.models.roles import OrganizationRoles
from src.database.session import session_scope
from src.database.models.users import User
from src.database.models.invitations import OrganizationInvitation


async def test_invitation_email_is_unique_within_organization(users: tuple[User, User, User]) -> None:
    """Prevent multiple active email grants with conflicting roles in one tenant."""

    # Arrange
    owner, _, _ = users
    organization = await create_organization(owner)
    async with session_scope() as session:
        session.add(OrganizationInvitation(organization_id=organization.id, email="invitee@example.com", role=OrganizationRoles.read))
        await session.commit()

    # Act / Assert
    async with session_scope() as session:
        session.add(OrganizationInvitation(organization_id=organization.id, email="invitee@example.com", role=OrganizationRoles.write))
        with pytest.raises(IntegrityError):
            await session.flush()
