from pydantic import Field, BaseModel


class OrganizationDatabaseUsageResponse(BaseModel):
    """Report PostgreSQL database bytes against the Organization's provisioned capacity.

    Database bytes include every schema and index, but not WAL, backups, or replicas.
    """

    # Measurement
    space_used: int = Field(ge=0)

    # Capacity
    quota_bytes: int = Field(ge=0)
