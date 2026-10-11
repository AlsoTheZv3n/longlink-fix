from uuid import UUID, uuid4
from typing import ClassVar
from datetime import UTC, datetime
from sqlmodel import Field
from sqlalchemy import Enum, Column
from src.models.billing import Plan
from src.database.models.base import PlatformModel


class BillingAccount(PlatformModel, table=True):
    """Retain one organization customer and its latest reconciled subscription state."""

    __tablename__: ClassVar[str] = "billing_accounts"

    # Identity
    customer_id: str | None = Field(default=None, max_length=255, unique=True)
    organization_id: UUID = Field(primary_key=True, foreign_key="organizations.id", ondelete="CASCADE")

    # Subscription
    plan: Plan = Field(default=Plan.free, sa_column=Column(Enum(Plan, native_enum=False), nullable=False))
    status: str = Field(default="free", max_length=64)
    period_end: datetime | None = None
    subscription_id: str | None = Field(default=None, max_length=255, unique=True)
    payment_required: bool = False
    cancel_at_period_end: bool = False

    # Checkout attempts and local billing deadlines
    checkout_id: str | None = Field(default=None, max_length=255)
    checkout_key: UUID = Field(default_factory=uuid4)
    next_action_at: datetime | None = Field(default=None, index=True)
    checkout_plan: Plan | None = Field(default=None, sa_column=Column(Enum(Plan, native_enum=False), nullable=True))
    checkout_quantity: int = Field(default=0)


class BillingEvent(PlatformModel, table=True):
    """Deduplicate verified webhooks without retaining invoices or customer payment data."""

    __tablename__: ClassVar[str] = "billing_events"

    # Identity
    id: str = Field(primary_key=True, max_length=255)

    # Retention
    received_at: datetime = Field(default_factory=lambda: datetime.now(UTC))
