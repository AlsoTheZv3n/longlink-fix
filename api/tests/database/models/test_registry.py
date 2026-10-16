import pytest
from sqlmodel import SQLModel
from sqlalchemy import inspect, create_engine
from src.database.models import registry

pytestmark = pytest.mark.no_db


def test_platform_schema_is_complete_and_isolated_from_solution_metadata() -> None:
    """Create all Platform tables without contaminating a Solution's own schema."""

    # Arrange
    engine = create_engine("sqlite:///:memory:")

    # Act
    try:
        registry.metadata.create_all(engine)
        tables = set(inspect(engine).get_table_names())
    finally:
        engine.dispose()

    # Assert
    assert registry.metadata is not SQLModel.metadata
    assert tables == {
        "users",
        "organizations",
        "organization_activities",
        "user_organizations",
        "organization_invitations",
        "compute_registries",
        "solutions",
        "revisions",
        "operations",
        "registry_connections",
        "mcp_clients",
        "mcp_codes",
        "mcp_tokens",
    }
