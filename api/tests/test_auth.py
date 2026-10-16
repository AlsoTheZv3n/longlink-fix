import pytest
from src import auth
from httpx2 import AsyncClient, ASGITransport
from fastapi import FastAPI
from src.database.models.users import User

pytestmark = pytest.mark.no_db

ADMINISTRATOR_ACCESS = [(False, 403, {"detail": "Permission required"}), (True, 200, {"administrator": True})]


@pytest.mark.parametrize(("administrator", "status", "payload"), ADMINISTRATOR_ACCESS)
async def test_administrator_dependency_requires_platform_role(administrator: bool, status: int, payload: dict[str, str | bool]) -> None:
    """Authorize an authenticated identity independently of browser credential validation."""

    # Arrange
    app = FastAPI()
    user = User(email="member@example.com", password="hashed-password", administrator=administrator)

    async def current_user() -> User:
        """Supply an authenticated identity at the dependency boundary."""

        return user

    app.dependency_overrides[auth.authuser] = current_user

    @app.get("/admin")
    async def administrator_only(user: auth.PlatformAdmin) -> dict[str, bool]:
        """Expose the identity admitted by the administrator dependency."""

        return {"administrator": user.administrator}

    # Act
    try:
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://testserver") as client:
            response = await client.get("/admin")
    finally:
        app.dependency_overrides.clear()

    # Assert
    assert response.status_code == status
    assert response.json() == payload
