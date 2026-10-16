from longlink.database import audit
from src.database.session import session_scope
from src.database.models.users import User


async def test_audit_records_attribute_updates_to_current_actor(users: tuple[User, User, User]) -> None:
    """Persist attribution with the mutation rather than relying on request-local state."""

    # Arrange
    actor, subject, _ = users

    # Act
    with audit.actor(actor.id):
        async with session_scope() as session:
            row = await session.get(User, subject.id)
            assert row is not None
            row.name = "Updated member"
            await session.commit()

    # Assert
    async with session_scope() as session:
        persisted = await session.get(User, subject.id)
    assert persisted is not None
    assert persisted.updated_id == actor.id
    assert persisted.name == "Updated member"
