import pytest
from sqlalchemy.exc import IntegrityError
from src.database.session import session_scope
from src.database.models.users import User


@pytest.mark.parametrize("provider", ["google_id", "github_id"])
async def test_external_identity_cannot_link_two_users(provider: str, users: tuple[User, User, User]) -> None:
    """Enforce external-account ownership even if two linking requests race."""

    # Arrange
    _, first, second = users
    async with session_scope() as session:
        row = await session.get(User, first.id)
        assert row is not None
        setattr(row, provider, "provider-subject")
        await session.commit()

    # Act / Assert
    async with session_scope() as session:
        row = await session.get(User, second.id)
        assert row is not None
        setattr(row, provider, "provider-subject")
        with pytest.raises(IntegrityError):
            await session.flush()
