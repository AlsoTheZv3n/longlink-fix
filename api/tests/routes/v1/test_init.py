import pytest
from fastapi import FastAPI
from src.routes import v1

pytestmark = pytest.mark.no_db


def test_versioned_routes_publish_shared_error_contract() -> None:
    """Keep versioned endpoint errors consistent in the generated client contract."""

    # Arrange
    app = FastAPI()
    app.include_router(v1.router)

    # Act
    responses = app.openapi()["paths"]["/api/v1/computes"]["get"]["responses"]

    # Assert
    error_schema = {"$ref": "#/components/schemas/ErrorResponse"}
    assert responses["422"]["description"] == "Unprocessable Entity"
    assert responses["422"]["content"]["application/json"]["schema"] == error_schema
    assert responses["default"]["content"]["application/json"]["schema"] == error_schema
