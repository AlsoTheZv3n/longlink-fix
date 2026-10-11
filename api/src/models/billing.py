from enum import StrEnum
from typing import Literal
from datetime import datetime
from pydantic import Field, HttpUrl, BaseModel


class Plan(StrEnum):
    """Supported organization plans."""

    free = "free"
    team = "team"


class PlanDetails(BaseModel):
    """Describe monthly per-seat prices and organization-wide resource allowances."""

    # Allowances and monthly price in CHF minor units
    seat_limit: int | None
    monthly_seat_price: int
    storage_quota_bytes: int
    database_quota_bytes: int


PLANS = {
    Plan.free: PlanDetails(seat_limit=5, monthly_seat_price=0, database_quota_bytes=100 * 1024**2, storage_quota_bytes=1024**3),
    Plan.team: PlanDetails(
        seat_limit=None,
        monthly_seat_price=500,
        database_quota_bytes=5 * 1024**3,
        storage_quota_bytes=25 * 1024**3,
    ),
}


class CheckoutRequest(BaseModel):
    """Choose a supported paid plan without accepting Stripe identifiers or seat quantities."""

    # Subscription
    plan: Literal[Plan.team]


class BillingRedirect(BaseModel):
    """Return a hosted Stripe session URL."""

    # Navigation
    url: HttpUrl


class BillingResponse(BaseModel):
    """Expose billing state without customer identifiers or payment details."""

    # Plan and subscription
    plan: Plan
    seats: int = Field(ge=0)
    status: str
    enabled: bool
    subscribed: bool
    payment_required: bool
    cancel_at_period_end: bool

    # Subscription dates
    period_end: datetime | None

    # Member allowance
    seat_limit: int | None
