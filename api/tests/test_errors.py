import pytest
from src import errors
from httpx2 import AsyncClient, ASGITransport
from fastapi import FastAPI

pytestmark = pytest.mark.no_db

ERROR_STATUSES = [
    (errors.ServiceError, 500),
    (errors.InvalidError, 422),
    (errors.NotFoundError, 404),
    (errors.ConflictError, 409),
    (errors.ForbiddenError, 403),
    (errors.UnavailableError, 503),
]


@pytest.mark.parametrize(("error", "status"), ERROR_STATUSES)
async def test_service_errors_expose_public_detail(error: type[errors.ServiceError], status: int) -> None:
    """Preserve the common HTTP error contract for domain failures."""

    # Arrange
    app = FastAPI()
    app.add_exception_handler(errors.ServiceError, errors.service_error_response)

    @app.get("/failure")
    async def failure() -> None:
        """Raise an expected service failure through HTTP."""

        raise error("Resource unavailable")

    # Act
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://testserver") as client:
        response = await client.get("/failure")

    # Assert
    assert response.status_code == status
    assert response.json() == {"detail": "Resource unavailable"}
