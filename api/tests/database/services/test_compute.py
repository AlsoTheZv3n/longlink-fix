import pytest
from fastapi import HTTPException
from factories import create_compute, create_organization
from src.database.session import session_scope
from src.database.services import compute
from src.models.pagination import Pagination
from src.database.models.users import User
from src.database.models.computes import ComputeRegistry


async def test_compute_search_treats_sql_wildcards_as_literal_characters() -> None:
    """Keep percent signs from broadening administrator searches."""

    # Arrange
    matching = await create_compute()
    await create_compute()
    async with session_scope() as session:
        row = await session.get(ComputeRegistry, matching.id)
        assert row is not None
        row.name = "100% dedicated"
        await session.commit()

    # Act
    async with session_scope() as session:
        items, total = await compute.fetch(session, Pagination(page_size=1), search="%")

    # Assert
    assert [item.id for item in items] == [matching.id]
    assert total == 1


async def test_assigned_compute_cannot_be_deleted(users: tuple[User, User, User]) -> None:
    """Keep tenant infrastructure assigned after rejected deletion."""

    # Arrange
    owner, _, _ = users
    organization = await create_organization(owner)

    # Act / Assert
    async with session_scope() as session:
        with pytest.raises(HTTPException, match="409: Compute registry is used by organizations"):
            await compute.delete(session, organization.compute_id)
        await session.commit()

    # Assert
    async with session_scope() as session:
        assert await session.get(ComputeRegistry, organization.compute_id) is not None
