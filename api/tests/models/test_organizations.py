import pytest
from pydantic import ValidationError
from src.models.organizations import OrganizationCreate, OrganizationInvitationCreate

pytestmark = pytest.mark.no_db


@pytest.mark.parametrize("name", ["", "x" * 129])
def test_organization_name_requires_bounded_content(name: str) -> None:
    """Reject names that cannot be admitted as Organization metadata."""

    # Act / Assert
    with pytest.raises(ValidationError, match="name"):
        OrganizationCreate(name=name)


def test_invitation_rejects_unknown_role() -> None:
    """Do not accept arbitrary role strings as email grants."""

    # Act / Assert
    with pytest.raises(ValidationError, match="role"):
        OrganizationInvitationCreate.model_validate({"email": "member@example.com", "role": "superuser"})
