import pytest
from fastapi import FastAPI
from src.routes import v1

pytestmark = pytest.mark.no_db


def test_versioned_routes_use_default_validation_schema() -> None:
    """Keep FastAPI's default validation schema for versioned endpoints."""

    # Arrange
    app = FastAPI()
    app.include_router(v1.router)

    # Act
    responses = app.openapi()["paths"]["/api/v1/computes"]["get"]["responses"]

    # Assert
    error_schema = {"$ref": "#/components/schemas/HTTPValidationError"}
    assert responses["422"]["description"] == "Validation Error"
    assert responses["422"]["content"]["application/json"]["schema"] == error_schema
    assert "default" not in responses
