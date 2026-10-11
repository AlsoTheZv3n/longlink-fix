import stripe
import asyncio
import contextlib
from uuid import UUID
from sqlmodel import col
from sqlalchemy import func, select
from src.errors import ConflictError, UnavailableError
from src.logger import logger
from collections.abc import AsyncIterator
from src.environments import env
from src.models.billing import PLANS, Plan
from sqlalchemy.ext.asyncio import AsyncSession
from src.database.models.users import User
from src.database.models.billing import BillingAccount
from src.database.models.association import UserOrganization


@contextlib.asynccontextmanager
async def client() -> AsyncIterator[stripe.StripeClient]:
    """Own a bounded async Stripe transport without modifying global SDK state."""

    # Reject paid actions unless the deployment has explicitly enabled billing.
    if not env.BILLING_ENABLED or env.STRIPE_SECRET_KEY is None:
        raise UnavailableError("Billing is not enabled on this deployment")
    transport = stripe.HTTPXClient(
        timeout=10,
    )
    connection = stripe.StripeClient(
        env.STRIPE_SECRET_KEY,
        http_client=transport,
        max_network_retries=2,
    )

    try:
        # Bound the complete Stripe interaction, including retry delays.
        async with asyncio.timeout(60):
            yield connection
    except (stripe.StripeError, TimeoutError) as exc:
        logger.warning("Stripe request failed: %s", type(exc).__name__)
        raise UnavailableError("Billing provider unavailable. Please try again.") from None
    finally:
        await transport.close_async()


async def seats(session: AsyncSession, organization_id: UUID) -> int:
    """Count every accepted membership, regardless of role, but exclude deleted users."""

    # Memberships, not pending invitations, define billable seats.
    count = await session.scalar(
        select(func.count())
        .select_from(UserOrganization)
        .join(User, col(User.id) == col(UserOrganization.user_id))
        .where(col(UserOrganization.organization_id) == organization_id, col(User.deleted_at).is_(None))
    )
    return count or 0


def effective_plan(account: BillingAccount | None) -> Plan:
    """Retain previously paid entitlements during payment recovery until the subscription ends."""

    # Ended, unknown, and never-paid subscriptions cannot grant paid access.
    if account is None or account.status not in {"active", "past_due", "unpaid"}:
        return Plan.free
    return account.plan


async def admit_member(session: AsyncSession, organization_id: UUID) -> bool:
    """Check seat admission while the caller holds the organization lock."""

    # Do not grow memberships during payment recovery, cancellation, or an over-limit downgrade.
    account = await session.get(BillingAccount, organization_id)
    if account is not None and (account.payment_required or account.cancel_at_period_end):
        return False
    limit = PLANS[effective_plan(account)].seat_limit
    return limit is None or await seats(session, organization_id) < limit


async def update_seats(session: AsyncSession, organization_id: UUID) -> None:
    """Apply accepted membership changes directly to Stripe under the organization lock."""

    # Free organizations and incomplete Checkouts have no subscription quantity to update.
    account = await session.get(BillingAccount, organization_id)
    if account is None or account.subscription_id is None:
        return

    # Flush the caller's membership mutation before counting its resulting seats.
    await session.flush()
    quantity = max(1, await seats(session, organization_id))
    async with client() as connection:
        subscription = await connection.v1.subscriptions.retrieve_async(account.subscription_id, {"expand": ["latest_invoice"]})
        if subscription.status in {"canceled", "incomplete_expired"}:
            return
        items: stripe.ListObject[stripe.SubscriptionItem] = subscription["items"]
        if len(items.data) != 1 or items.has_more:
            raise ConflictError("Subscription items require billing administrator review")
        item = items.data[0]
        if quantity == (item.quantity or 0):
            return
        increasing = quantity > (item.quantity or 0)
        if (
            price_plan(item.price.id) == Plan.free
            or subscription.pending_update is not None
            or subscription.status not in {"active", "past_due", "unpaid"}
            or (increasing and subscription.status != "active")
        ):
            raise ConflictError("Resolve the subscription's payment or pending update before changing members")

        # Only accepted, paid seat additions commit locally; removals change renewal quantity without refunds.
        invoice = subscription.latest_invoice
        invoice_id = invoice.id if isinstance(invoice, stripe.Invoice) else "none"
        await connection.v1.subscriptions.update_async(
            subscription.id,
            {
                "items": [{"id": item.id, "quantity": quantity}],
                "proration_behavior": "always_invoice" if increasing else "none",
                "payment_behavior": "error_if_incomplete" if increasing else "allow_incomplete",
            },
            options={"idempotency_key": f"seats:{subscription.id}:{item.current_period_start}:{invoice_id}:{quantity}"},
        )


def price_plan(price_id: str | None) -> Plan:
    """Map only deployment-approved Stripe prices to paid plans."""

    # Unknown dashboard-created prices never grant paid entitlements.
    if price_id is not None and price_id == env.STRIPE_TEAM_PRICE_ID:
        return Plan.team
    return Plan.free
