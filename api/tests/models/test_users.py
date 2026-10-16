import pytest
from pydantic import ValidationError
from src.models.users import UserUpdate

pytestmark = pytest.mark.no_db


def test_profile_update_distinguishes_omitted_and_cleared_avatar() -> None:
    """Preserve PATCH field presence when clearing an optional profile value."""

    # Act
    unchanged = UserUpdate()
    cleared = UserUpdate(avatar=None)

    # Assert
    assert unchanged.model_dump(exclude_unset=True) == {}
    assert cleared.model_dump(exclude_unset=True) == {"avatar": None}


def test_profile_update_rejects_empty_name() -> None:
    """Do not replace a user's name with empty content."""

    # Act / Assert
    with pytest.raises(ValidationError, match="name"):
        UserUpdate(name="")
