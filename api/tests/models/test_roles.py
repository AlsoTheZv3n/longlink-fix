import pytest
from src.models.roles import SOLUTION_PROXY_METHOD_ROLES, OrganizationRoles

pytestmark = pytest.mark.no_db


def test_proxy_methods_require_the_documented_roles() -> None:
    """Keep destructive proxy requests stricter than writes and reads."""

    # Assert
    assert SOLUTION_PROXY_METHOD_ROLES == {
        "GET": OrganizationRoles.read,
        "POST": OrganizationRoles.write,
        "PUT": OrganizationRoles.write,
        "PATCH": OrganizationRoles.write,
        "DELETE": OrganizationRoles.maintain,
    }
