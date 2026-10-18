from uuid import UUID
from datetime import UTC, datetime
from sqlmodel import Field, SQLModel
from sqlalchemy import Column, DateTime
from longlink.types import Email


class User(SQLModel, table=True):
    """Store a Platform user's last-seen profile in one Solution."""

    __tablename__ = "users"

    # Identifier
    id: UUID = Field(primary_key=True)

    # Profile
    name: str = Field(max_length=255)
    email: Email = Field(max_length=254)
    avatar: str = Field(default="", max_length=2048)
    updated_at: datetime = Field(default_factory=lambda: datetime.now(UTC), sa_column=Column(DateTime(timezone=True), nullable=False))
