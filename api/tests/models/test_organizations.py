import pytest
from pydantic import ValidationError
from src.models.organizations import OrganizationInvitationCreate

pytestmark = pytest.mark.no_db


def test_invitation_rejects_unknown_role() -> None:
    """Do not accept arbitrary role strings as email grants."""

    # Act / Assert
    with pytest.raises(ValidationError, match="role"):
        OrganizationInvitationCreate.model_validate({"email": "member@example.com", "role": "superuser"})
