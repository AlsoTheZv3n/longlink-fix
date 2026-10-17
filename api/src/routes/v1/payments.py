from src import auth
from uuid import UUID
from stripe import Webhook, SignatureVerificationError
from fastapi import Request, APIRouter, HTTPException
from datetime import UTC, datetime
from sqlmodel import col
from src.utils import stripe
from sqlalchemy import select
from src.models import pricing
from src.environments import env
from src.models.roles import OrganizationRoles
from src.models.payments import PaymentCard, PaymentInvoice, PaymentRedirect
from src.database.services import payments, organizations
from src.database.models.organizations import Organization

router = APIRouter()


@router.get("/pricing", response_model=pricing.UsageRates)
async def get_pricing():
    """Publish the same included usage and rates used by monthly invoices."""

    return pricing.RATES


@router.get("/organizations/{organization_id}/cards", response_model=list[PaymentCard])
async def get_cards(organization_id: UUID, user: auth.CurrentUser, session: auth.Session):
    """List masked saved cards for the current Organization owner."""

    # Resolve ownership before accessing the Organization's Stripe customer.
    await organizations.require_membership(session, user.id, organization_id, OrganizationRoles.owner)
    organization = await session.get(Organization, organization_id)
    if not env.stripe_enabled or organization is None or organization.stripe_customer_id is None:
        return []

    # Read current Stripe details rather than persisting duplicate card metadata.
    async with stripe.client() as connection:
        customer = await connection.v1.customers.retrieve_async(organization.stripe_customer_id)
        if customer.get("deleted", False):
            return []
        default = customer.invoice_settings.default_payment_method
        methods = await connection.v1.payment_methods.list_async(
            {"customer": organization.stripe_customer_id, "type": "card", "limit": 100}
        )
        return [
            {
                "id": method.id,
                "brand": method.card.brand,
                "last4": method.card.last4,
                "exp_year": method.card.exp_year,
                "exp_month": method.card.exp_month,
                "is_default": method.id == default,
            }
            async for method in methods.auto_paging_iter()
            if method.card is not None
        ]


@router.get("/organizations/{organization_id}/invoices", response_model=list[PaymentInvoice])
async def get_invoices(organization_id: UUID, user: auth.CurrentUser, session: auth.Session):
    """List issued invoices and hosted documents for the current Organization owner."""

    # Keep accounting documents private to owners of the mapped Organization.
    await organizations.require_membership(session, user.id, organization_id, OrganizationRoles.owner)
    organization = await session.get(Organization, organization_id)
    if not env.stripe_enabled or organization is None or organization.stripe_customer_id is None:
        return []

    # Stripe remains authoritative for invoice status, payment outcomes, and document URLs.
    async with stripe.client() as connection:
        invoices = await connection.v1.invoices.list_async({"customer": organization.stripe_customer_id, "limit": 100})
        return [
            {
                "id": invoice.id,
                "total": invoice.total,
                "number": invoice.number,
                "status": invoice.status,
                "currency": invoice.currency,
                "created_at": datetime.fromtimestamp(invoice.created, UTC),
                "invoice_pdf": invoice.invoice_pdf,
                "hosted_invoice_url": invoice.hosted_invoice_url,
            }
            async for invoice in invoices.auto_paging_iter()
            if invoice.status in {"open", "paid", "void", "uncollectible"}
        ]


@router.post("/organizations/{organization_id}/cards/checkout", response_model=PaymentRedirect)
async def create_checkout(organization_id: UUID, user: auth.CurrentUser, session: auth.Session):
    """Save an invoice payment method without taking an immediate payment."""

    # Serialize card registration with membership changes and deletion.
    organization = await organizations.lock(session, organization_id)
    await organizations.locked_membership(session, user.id, organization_id, OrganizationRoles.owner)
    async with stripe.client() as connection:
        url = await payments.checkout(session, organization, user.id, connection)
    await session.commit()
    return {"url": url}


@router.post("/stripe/webhook", status_code=204)
async def receive_webhook(request: Request, session: auth.Session):
    """Verify card-registration events and apply them directly to the Organization."""

    # Signed webhooks do not use browser credentials, and unconfigured deployments reject them.
    if not env.stripe_enabled or env.STRIPE_WEBHOOK_SECRET is None:
        raise HTTPException(status_code=503, detail="Stripe is not configured")
    body = bytearray()
    async for chunk in request.stream():
        body.extend(chunk)
        if len(body) > 1024 * 1024:
            raise HTTPException(status_code=413, detail="Webhook too large")
    try:
        event = Webhook.construct_event(bytes(body), request.headers.get("stripe-signature", ""), env.STRIPE_WEBHOOK_SECRET)
    except (ValueError, SignatureVerificationError):
        raise HTTPException(status_code=400, detail="Invalid Stripe signature") from None
    live = (env.STRIPE_SECRET_KEY or "").startswith(("sk_live_", "rk_live_"))
    if event.livemode != live:
        raise HTTPException(status_code=400, detail="Stripe mode mismatch")

    # Checkout identity and Stripe idempotency make repeated events safe without an event ledger.
    if event.type != "checkout.session.completed":
        return
    customer_id = event.data.object.get("customer")
    if not isinstance(customer_id, str) or not customer_id.startswith("cus_") or len(customer_id) > 255:
        return
    organization_id = await session.scalar(select(col(Organization.id)).where(col(Organization.stripe_customer_id) == customer_id))
    if organization_id is None:
        return
    organization = await organizations.lock(session, organization_id)
    if organization.deleted_at is None and event.data.object.get("id") == organization.stripe_checkout_id:
        async with stripe.client() as connection:
            hosted = await connection.v1.checkout.sessions.retrieve_async(organization.stripe_checkout_id)
            await payments.save_card(session, organization, hosted, connection)
    await session.commit()
