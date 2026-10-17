import stripe
from uuid import UUID, uuid4
from datetime import UTC, datetime
from src.utils import dates
from src.errors import ConflictError, ForbiddenError, UnavailableError
from src.models import pricing
from src.environments import env
from src.models.roles import OrganizationRoles
from src.database.services import operations, organizations
from src.models.operations import OperationKind
from sqlalchemy.ext.asyncio import AsyncSession
from src.database.models.organizations import Organization


async def save_card(
    session: AsyncSession, organization: Organization, hosted: stripe.checkout.Session, connection: stripe.StripeClient
) -> None:
    """Save the verified invoice payment method directly on its Organization."""

    # A delayed or unrelated Checkout cannot replace this Organization's default card.
    if (
        hosted.id != organization.stripe_checkout_id
        or hosted.customer != organization.stripe_customer_id
        or hosted.mode != "setup"
        or hosted.status != "complete"
        or not isinstance(hosted.setup_intent, str)
        or organization.stripe_customer_id is None
    ):
        return
    intent = await connection.v1.setup_intents.retrieve_async(hosted.setup_intent)
    if intent.status != "succeeded" or intent.customer != organization.stripe_customer_id or not isinstance(intent.payment_method, str):
        raise ConflictError("Card registration is not complete")

    # Stripe retains payment details; the local reference permits usage beyond the free allowance.
    await connection.v1.customers.update_async(
        organization.stripe_customer_id,
        {"invoice_settings": {"default_payment_method": intent.payment_method}},
        options={"idempotency_key": f"card:{hosted.id}"},
    )

    # First registration cannot charge for months before payment authorization.
    if organization.stripe_payment_method_id is None:
        organization.invoice_due_at = max(organization.invoice_due_at, dates.next_month(datetime.now(UTC)))
    organization.stripe_payment_method_id = intent.payment_method

    # Expand provisioned capacity without introducing plans or shrinking existing volumes.
    size_mib = max(organization.database_size_mib, pricing.REGISTERED_DATABASE_SIZE_MIB)
    storage_bytes = max(organization.storage_quota_bytes, pricing.REGISTERED_STORAGE_QUOTA_BYTES)
    if size_mib != organization.database_size_mib or storage_bytes != organization.storage_quota_bytes:
        organization.database_size_mib = size_mib
        organization.storage_quota_bytes = storage_bytes
        await operations.enqueue(session, kind=OperationKind.organization_create, target_id=organization.id, coalesce=False)


async def checkout(session: AsyncSession, organization: Organization, user_id: UUID, connection: stripe.StripeClient) -> str:
    """Create or reuse an owner-authorized, durable hosted card-registration attempt."""

    # Persist the Organization's customer before creating its hosted card-registration attempt.
    if organization.deleted_at is not None:
        raise ForbiddenError("Organization unavailable")
    if organization.stripe_customer_id is None:
        customer = await connection.v1.customers.create_async(
            {"name": organization.name, "metadata": {"organization_id": str(organization.id)}},
            options={"idempotency_key": f"customer:{organization.id}"},
        )
        organization.stripe_customer_id = customer.id
        await session.commit()
        organization = await organizations.lock(session, organization.id)
        await organizations.locked_membership(session, user_id, organization.id, OrganizationRoles.owner)
        if organization.deleted_at is not None:
            raise ForbiddenError("Organization unavailable")

    # Reuse open attempts and recover completed setup when a webhook was delayed.
    if organization.stripe_checkout_id is not None:
        existing = await connection.v1.checkout.sessions.retrieve_async(organization.stripe_checkout_id)
        if existing.status == "open":
            if existing.url is None:
                raise UnavailableError("Checkout URL unavailable")
            return existing.url
        await save_card(session, organization, existing, connection)
        organization.stripe_checkout_id = None
        organization.stripe_checkout_key = uuid4()

    # Persist the attempt before contacting Stripe, then reauthorize after releasing the lock.
    await session.commit()
    organization = await organizations.lock(session, organization.id)
    await organizations.locked_membership(session, user_id, organization.id, OrganizationRoles.owner)
    if organization.deleted_at is not None:
        raise ForbiddenError("Organization unavailable")
    if organization.stripe_checkout_id is not None:
        existing = await connection.v1.checkout.sessions.retrieve_async(organization.stripe_checkout_id)
        if existing.status == "open" and existing.url is not None:
            return existing.url
        raise ConflictError("Card registration already started. Refresh usage.")

    # Hosted consent covers the published month-end usage charges, not a subscription or immediate payment.
    hosted = await connection.v1.checkout.sessions.create_async(
        {
            "mode": "setup",
            "customer": organization.stripe_customer_id,
            "client_reference_id": str(organization.id),
            "payment_method_types": ["card"],
            "setup_intent_data": {"metadata": {"organization_id": str(organization.id)}},
            "custom_text": {
                "submit": {
                    "message": "By saving your card, you authorize LongLink to charge it monthly for your organization's "
                    "month-end users, database, and file storage above the free allowances at the published prices. "
                    "No payment is taken now."
                }
            },
            "success_url": f"{env.PUBLIC_URL}/orgs/{organization.slug}/settings#payment-methods",
            "cancel_url": f"{env.PUBLIC_URL}/orgs/{organization.slug}/settings#payment-methods",
        },
        options={"idempotency_key": f"card-checkout:{organization.stripe_checkout_key}"},
    )
    organization.stripe_checkout_id = hosted.id

    # Recovered remote attempts may already be complete or expired.
    if hosted.status != "open":
        await save_card(session, organization, hosted, connection)
        return f"{env.PUBLIC_URL}/orgs/{organization.slug}/settings#payment-methods"
    if hosted.url is None:
        raise UnavailableError("Checkout URL unavailable")
    return hosted.url
