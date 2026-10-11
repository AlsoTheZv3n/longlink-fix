import pytest
from httpx2 import AsyncClient, ASGITransport
from factories import create_organization
from collections.abc import Mapping, Sequence
from src.database.session import session_scope
from src.database.services import organizations as organization_service
from src.models.organizations import DatabaseState
from src.database.models.users import User
from src.database.models.organizations import Organization


async def test_get_me_returns_authenticated_user_profile_and_separate_org_memberships(
    clients: tuple[AsyncClient, AsyncClient, AsyncClient],
    users: tuple[User, User, User],
) -> None:
    """Return profile and organization memberships from separate endpoints."""

    # Arrange
    user = users[0]
    organization = await create_organization(user)
    client = clients[0]

    # Act
    profile_response = await client.get("/api/v1/me")
    organizations_response = await client.get("/api/v1/me/organizations")

    # Assert
    assert profile_response.status_code == 200
    assert profile_response.headers["cache-control"] == "no-store"
    assert profile_response.json() == {
        "id": str(user.id),
        "name": user.name,
        "email": user.email,
        "avatar": user.avatar,
        "administrator": user.administrator,
    }

    assert organizations_response.status_code == 200
    assert organizations_response.headers["cache-control"] == "no-store"
    assert organizations_response.json() == [
        {
            "organization": {
                "id": str(organization.id),
                "name": "acme",
                "slug": "acme",
                "status": "creating",
            },
            "role": "owner",
        }
    ]


async def test_get_my_organizations_excludes_soft_deleted_organizations(
    clients: tuple[AsyncClient, AsyncClient, AsyncClient],
    users: tuple[User, User, User],
) -> None:
    """Hide soft-deleted Organizations from the authenticated user's organization switcher."""

    # Arrange
    user = users[0]
    active = await create_organization(user, name="active")
    deleted = await create_organization(user, name="deleted")
    async with session_scope() as session:
        await organization_service.soft_delete(session, deleted.id, user)
        await session.commit()
    client = clients[0]

    # Act
    response = await client.get("/api/v1/me/organizations")

    # Assert
    assert response.status_code == 200
    assert [item["organization"]["id"] for item in response.json()] == [str(active.id)]


async def test_list_users_returns_administrator_page_and_total(
    clients: tuple[AsyncClient, AsyncClient, AsyncClient],
    users: tuple[User, User, User],
) -> None:
    """Return a bounded administrator page with the full visible-user total."""

    # Act
    response = await clients[0].get("/api/v1/users?page=2&page_size=1")

    # Assert
    assert response.status_code == 200
    payload = response.json()
    assert len(payload["items"]) == 1
    assert payload["items"][0]["name"] == "Platform Administrator"
    assert payload["total"] == 3
    assert set(payload["items"][0]) == {"id", "name", "email", "avatar", "administrator", "created_at"}
    assert users[0].password not in response.text


@pytest.mark.no_db
async def test_list_users_rejects_anonymous_requests(client: AsyncClient) -> None:
    """Require authentication before exposing user summaries."""

    # Act
    response = await client.get("/api/v1/users")

    # Assert
    assert response.status_code == 401
    assert response.json() == {"detail": "Not authenticated"}


async def test_patch_me_persists_profile_name(
    clients: tuple[AsyncClient, AsyncClient, AsyncClient],
    users: tuple[User, User, User],
) -> None:
    """Persist an updated profile name."""

    # Arrange
    user = users[0]
    expected_name = "Updated User"

    # Act
    response = await clients[0].patch("/api/v1/me", json={"name": expected_name})

    # Assert
    assert response.status_code == 200
    assert response.json()["name"] == expected_name
    async with session_scope() as session:
        persisted_user = await session.get(User, user.id)
        assert persisted_user is not None
        assert persisted_user.name == expected_name


async def test_patch_me_commits_before_shared_delivery_and_retries_unchanged_profile(
    clients: tuple[AsyncClient, AsyncClient, AsyncClient],
    users: tuple[User, User, User],
    database_runtime: None,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    """Keep authoritative updates after failed delivery and retry an identical payload."""

    from main import app

    # Arrange
    user = users[1]
    organization = await create_organization(user)
    async with session_scope() as session:
        current = await session.get(Organization, organization.id)
        assert current is not None
        current.database_state = DatabaseState.available
        await session.commit()
    expected_name = "Updated User"
    delivered: list[dict[str, object]] = []

    async def deliver(_connection: object, rows: Sequence[Mapping[str, object]]) -> None:
        """Observe committed Platform state at the shared-database delivery boundary."""

        # Read independently so an uncommitted request identity map cannot satisfy the assertion.
        async with session_scope() as session:
            persisted_user = await session.get(User, user.id)
            assert persisted_user is not None
            assert persisted_user.name == expected_name
        assert [dict(row) for row in rows] == [{"id": user.id, "name": expected_name, "email": user.email, "avatar": user.avatar}]
        delivered.append(dict(rows[0]))
        if len(delivered) == 1:
            raise RuntimeError("shared profile delivery failed")

    monkeypatch.setattr("src.database.services.organizations.shared_audit.sync", deliver)

    # Act
    async with AsyncClient(
        transport=ASGITransport(app=app, raise_app_exceptions=False),
        base_url="http://testserver",
        cookies=clients[1].cookies,
        headers=clients[1].headers,
    ) as client:
        failed = await client.patch("/api/v1/me", json={"name": expected_name})

        # Assert the failed external delivery did not undo the authoritative commit.
        assert failed.status_code == 500
        assert failed.json() == {"detail": "An unexpected error occurred. Please try again later."}
        assert len(delivered) == 1
        async with session_scope() as session:
            persisted_user = await session.get(User, user.id)
            assert persisted_user is not None
            assert persisted_user.name == expected_name

        # Act: repeat exactly the same profile payload to retry delivery.
        retried = await client.patch("/api/v1/me", json={"name": expected_name})

    # Assert
    assert retried.status_code == 200
    assert retried.json() == {
        "id": str(user.id),
        "name": expected_name,
        "email": user.email,
        "avatar": user.avatar,
        "administrator": user.administrator,
    }
    assert len(delivered) == 2
    assert delivered[1] == delivered[0]
