import stripe
from src import auth, operations
from uuid import UUID
from fastapi import Request, APIRouter, HTTPException
from sqlmodel import col
from sqlalchemy import select
from src.errors import ForbiddenError
from sqlalchemy.exc import IntegrityError
from src.environments import env
from src.models.roles import OrganizationRoles
from src.models.billing import PLANS, BillingRedirect, BillingResponse, CheckoutRequest
from src.database.services import billing, organizations
from src.database.models.billing import BillingEvent, BillingAccount
from src.database.models.organizations import Organization

router = APIRouter()


@router.get("/organizations/{organization_id}/billing", response_model=BillingResponse)
async def get_billing(organization_id: UUID, user: auth.CurrentUser, session: auth.Session):
    """Show plan and seat totals to organization members without exposing payment information."""

    # Authorize before reading any organization billing state.
    await organizations.require_membership(session, user.id, organization_id)
    organization = await session.get(Organization, organization_id, populate_existing=True)
    if organization is None:
        raise ForbiddenError("Organization unavailable")
    account = await session.get(BillingAccount, organization_id)
    plan = billing.effective_plan(account)
    details = PLANS[plan]
    count = await billing.seats(session, organization_id)

    # Show server-confirmed membership counts and previously paid entitlements.
    return {
        "plan": plan,
        "seats": count,
        "status": account.status if account else "free",
        "enabled": env.BILLING_ENABLED,
        "subscribed": account is not None and account.subscription_id is not None,
        "payment_required": account.payment_required if account else False,
        "cancel_at_period_end": account.cancel_at_period_end if account else False,
        "period_end": account.period_end if account else None,
        "seat_limit": details.seat_limit,
    }


@router.post("/organizations/{organization_id}/billing/checkout", response_model=BillingRedirect)
async def create_checkout(organization_id: UUID, payload: CheckoutRequest, user: auth.CurrentUser, session: auth.Session):
    """Allow current organization owners to start a hosted subscription checkout."""

    # Serialize and revalidate ownership before any external billing mutation.
    organization = await organizations.lock(session, organization_id)
    await organizations.require_membership(session, user.id, organization_id, OrganizationRoles.owner)
    async with billing.client() as connection:
        url = await operations.billing.checkout(session, organization, payload.plan, user.id, connection)
    await session.commit()
    return {"url": url}


@router.post("/organizations/{organization_id}/billing/portal", response_model=BillingRedirect)
async def create_portal(organization_id: UUID, user: auth.CurrentUser, session: auth.Session):
    """Allow current owners to manage payment details, invoices, plans, and cancellation in Stripe."""

    # Keep customer mapping and authorization bound to the same locked organization.
    organization = await organizations.lock(session, organization_id)
    await organizations.require_membership(session, user.id, organization_id, OrganizationRoles.owner)
    async with billing.client() as connection:
        url = await operations.billing.portal(session, organization, connection)
    await session.commit()
    return {"url": url}


@router.post("/billing/webhook", status_code=204)
async def receive_webhook(request: Request, session: auth.Session):
    """Durably acknowledge only signed Stripe events for this deployment's billing mode."""

    # Webhooks use Stripe signatures, not browser cookies or organization credentials.
    if not env.BILLING_ENABLED or env.STRIPE_WEBHOOK_SECRET is None:
        raise HTTPException(status_code=503, detail="Billing is not enabled")
    body = bytearray()
    async for chunk in request.stream():
        body.extend(chunk)
        if len(body) > 1024 * 1024:
            raise HTTPException(status_code=413, detail="Webhook too large")
    try:
        event = stripe.Webhook.construct_event(bytes(body), request.headers.get("stripe-signature", ""), env.STRIPE_WEBHOOK_SECRET)
    except (ValueError, stripe.SignatureVerificationError):
        raise HTTPException(status_code=400, detail="Invalid Stripe signature") from None
    live = (env.STRIPE_SECRET_KEY or "").startswith(("sk_live_", "rk_live_"))
    if event.livemode != live:
        raise HTTPException(status_code=400, detail="Stripe mode mismatch")

    # Ignore unrelated event types and store no raw invoice or payment payloads.
    if not event.type.startswith(("customer.subscription.", "invoice.", "checkout.session.")):
        return
    customer_id = event.data.object.get("customer")
    if not isinstance(customer_id, str) or not customer_id.startswith("cus_") or len(customer_id) > 255:
        return
    if not isinstance(event.id, str) or len(event.id) > 255:
        raise HTTPException(status_code=400, detail="Invalid Stripe event")

    # Serialize with membership changes before processing or deduplicating a customer's event.
    organization_id = await session.scalar(
        select(col(BillingAccount.organization_id)).where(col(BillingAccount.customer_id) == customer_id)
    )
    organization = await organizations.lock(session, organization_id) if organization_id is not None else None

    # Uniqueness makes redelivery safe; failed processing rolls back the event and Stripe can retry it.
    try:
        async with session.begin_nested():
            session.add(BillingEvent(id=event.id))
            await session.flush()
    except IntegrityError:
        return
    if organization is not None and organization.deleted_at is None:
        account = await session.get(BillingAccount, organization.id, populate_existing=True)
        if account is not None:
            async with billing.client() as connection:
                current = await operations.billing.subscription(account, connection)
            await operations.billing.apply_subscription(session, organization, account, current)

            # Checkout may complete after membership changes, and paid updates may recover a rolled-back request.
            if current is not None and current.status == "active" and current.pending_update is None:
                await billing.update_seats(session, organization.id)
    await session.commit()
