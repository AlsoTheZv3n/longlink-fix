import pytest
from uuid import UUID
from src.kubernetes import namespace

pytestmark = pytest.mark.no_db


def test_organization_workloads_and_databases_use_separate_network_boundaries() -> None:
    """Keep workload and database DNS names in their tenant-specific namespaces."""

    # Arrange
    organization = UUID("12345678-1234-5678-1234-567812345678")
    solution = UUID("87654321-4321-8765-4321-876543218765")

    # Act / Assert
    assert namespace.compute(organization) == "longlink-compute-12345678123456781234567812345678"
    assert namespace.database(organization) == "longlink-database-12345678123456781234567812345678"
    assert namespace.database_hostname(organization) == "database-rw.longlink-database-12345678123456781234567812345678.svc.cluster.local"
    assert namespace.solution_hostname(organization, solution) == (
        "solution-87654321-4321-8765-4321-876543218765.longlink-compute-12345678123456781234567812345678.svc.cluster.local"
    )
