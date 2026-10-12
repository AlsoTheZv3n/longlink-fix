from uuid import UUID
from datetime import datetime
from longlink import User
from pydantic import Field, BaseModel, ConfigDict
from src.models.items import ItemStatus


class ItemCreate(BaseModel):
    """Typed request for creating a catalog item."""

    # Item fields
    name: str = Field(min_length=1, max_length=255)
    price: float = Field(default=0, ge=0)
    status: ItemStatus = ItemStatus.draft


class ItemStatusUpdate(BaseModel):
    """Validate a requested invoice approval state."""

    # Approval state
    status: ItemStatus


class ItemRead(BaseModel):
    """Catalog item response including its Platform creator."""

    model_config = ConfigDict(from_attributes=True)

    # Item fields
    id: int
    name: str
    price: float
    status: ItemStatus

    # Audit timestamps
    created_at: datetime
    updated_at: datetime

    # Audit user identifiers
    created_id: UUID
    updated_id: UUID

    # Creator details
    created_by: User | None
    approved_by: User | None


class ItemPage(BaseModel):
    """One page of invoices and the total number available."""

    # Pagination fields
    items: list[ItemRead]
    total: int


class ItemAttachmentRead(BaseModel):
    """Typed response for one stored attachment."""

    # File fields
    id: str
    name: str
    size: int = Field(ge=0)
