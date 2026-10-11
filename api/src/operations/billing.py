import stripe
import asyncio
from uuid import UUID, uuid4
from datetime import UTC, datetime, timedelta
from sqlmodel import col
from sqlalchemy import delete, select, update
from src.errors import InvalidError, ConflictError, ForbiddenError, UnavailableError
from src.logger import logger
from src.environments import env
from src.models.roles import OrganizationRoles
from src.models.billing import PLANS, Plan
from src.models.statuses import Status
from src.database.session import session_scope
from src.database.services import billing, operations, organizations
from src.models.operations import OperationKind
from sqlalchemy.ext.asyncio import AsyncSession
from src.database.models.billing import BillingEvent, BillingAccount
from src.database.models.organizations import Organization


async def validate_price(connection: stripe.StripeClient, plan: Plan) -> stripe.Price:
    """Require the advertised monthly CHF licensed per-seat price."""

    # Stripe configuration must match the public price, rather than silently charging a different amount.
    price_id = env.STRIPE_TEAM_PRICE_ID
    if plan != Plan.team or price_id is None:
        raise InvalidError("Choose a paid plan")
    price = await connection.v1.prices.retrieve_async(price_id)
    if (
        not price.active
        or price.currency != "chf"
        or price.unit_amount != PLANS[plan].monthly_seat_price
        or price.billing_scheme != "per_unit"
        or price.recurring is None
        or price.recurring.interval != "month"
        or price.recurring.interval_count != 1
        or price.recurring.usage_type != "licensed"
        or price.transform_quantity is not None
    ):
        raise UnavailableError("Stripe price does not match the published plan")
    return price


async def subscription(account: BillingAccount, connection: stripe.StripeClient) -> stripe.Subscription | None:
    """Read current subscription state for Checkout admission and signed webhook handling."""

    # Discover remote subscriptions even if Checkout completed before its webhook reached the Platform.
    if account.customer_id is None:
        return None
    subscriptions = await connection.v1.subscriptions.list_async(
        {"customer": account.customer_id, "status": "all", "limit": 100, "expand": ["data.latest_invoice"]}
    )
    current = [
        subscription
        async for subscription in subscriptions.auto_paging_iter()
        if subscription.status not in {"canceled", "incomplete_expired"}
    ]
    if len(current) > 1:
        raise ConflictError("Multiple subscriptions require billing administrator review")
    return current[0] if current else None


async def apply_subscription(
    session: AsyncSession, organization: Organization, account: BillingAccount, current: stripe.Subscription | None
) -> None:
    """Apply webhook-confirmed payment and plan facts without mutating Stripe seat quantities."""

    # A canceled subscription returns to Free without deleting existing members or physical database capacity.
    if not current:
        account.plan = Plan.free
        account.status = "free"
        account.subscription_id = None
        account.period_end = None
        account.payment_required = False
        account.cancel_at_period_end = False
    else:
        subscription = current
        items: stripe.ListObject[stripe.SubscriptionItem] = subscription["items"]
        if len(items.data) != 1 or items.has_more:
            raise ConflictError("Subscription items require billing administrator review")
        item = items.data[0]
        plan = billing.price_plan(item.price.id)
        account.status = subscription.status if plan != Plan.free else "unsupported"
        account.subscription_id = subscription.id
        account.period_end = datetime.fromtimestamp(item.current_period_end, UTC)
        account.cancel_at_period_end = subscription.cancel_at_period_end

        # First payment and plan upgrades must be paid; an unpaid upgrade retains only the previous plan.
        invoice = subscription.latest_invoice
        paid = isinstance(invoice, stripe.Invoice) and invoice.status == "paid"
        if subscription.status == "active" and paid and subscription.pending_update is None and plan != Plan.free:
            account.plan = plan
            account.payment_required = False
        elif subscription.status in {"active", "past_due", "unpaid"}:
            account.payment_required = True

    await apply_allowances(session, organization, account)


async def apply_allowances(session: AsyncSession, organization: Organization, account: BillingAccount) -> None:
    """Queue infrastructure changes from the effective plan without contacting Stripe."""

    # Resource reconciliation never shrinks a persistent database volume on downgrades.
    details = PLANS[billing.effective_plan(account)]
    database_size = max(organization.database_size_mib, details.database_quota_bytes // 1024**2)
    if database_size != organization.database_size_mib or organization.storage_quota_bytes != details.storage_quota_bytes:
        organization.database_size_mib = database_size
        organization.storage_quota_bytes = details.storage_quota_bytes
        await operations.enqueue(session, kind=OperationKind.organization_create, target_id=organization.id, coalesce=False)
    elif organization.status == Status.failed:
        # Retry acknowledged desired allowances after a transient infrastructure failure.
        await operations.enqueue(session, kind=OperationKind.organization_create, target_id=organization.id)


async def checkout(session: AsyncSession, organization: Organization, plan: Plan, user_id: UUID, connection: stripe.StripeClient) -> str:
    """Create or reuse one serialized, idempotent hosted subscription checkout."""

    # Persist mutation identifiers before contacting Stripe so retries survive a local transaction failure.
    account = await session.get(BillingAccount, organization.id)
    if account is None:
        account = BillingAccount(organization_id=organization.id)
        session.add(account)
        await session.commit()
        organization = await organizations.lock(session, organization.id)
        await organizations.locked_membership(session, user_id, organization.id, OrganizationRoles.owner)
        account = await session.get(BillingAccount, organization.id, populate_existing=True)
    if organization.deleted_at is not None:
        raise ForbiddenError("Organization unavailable")
    if account is None:
        raise ConflictError("Billing account unavailable")
    await validate_price(connection, plan)

    # Recover customer creation using an organization-stable key without exposing buyer-controlled metadata.
    if account.customer_id is None:
        customer = await connection.v1.customers.create_async(
            {"name": organization.name, "metadata": {"organization_id": str(organization.id)}},
            options={"idempotency_key": f"customer:{organization.id}"},
        )
        account.customer_id = customer.id
        await session.commit()
        organization = await organizations.lock(session, organization.id)
        await organizations.locked_membership(session, user_id, organization.id, OrganizationRoles.owner)
        account = await session.get(BillingAccount, organization.id, populate_existing=True)
        if organization.deleted_at is not None or account is None:
            raise ForbiddenError("Organization unavailable")

    # Reject a second subscription even before its first webhook reaches LongLink.
    if await subscription(account, connection) is not None:
        raise ConflictError("Manage the existing subscription through the billing portal")
    if account.checkout_id is not None:
        existing = await connection.v1.checkout.sessions.retrieve_async(account.checkout_id)
        if existing.status == "open":
            if account.checkout_plan == plan:
                if existing.url is None:
                    raise UnavailableError("Checkout URL unavailable")
                return existing.url
            await connection.v1.checkout.sessions.expire_async(existing.id)
        if existing.status == "complete":
            if not isinstance(existing.subscription, str):
                raise ConflictError("Payment is processing. Refresh billing before starting another checkout.")
            previous = await connection.v1.subscriptions.retrieve_async(existing.subscription)
            if previous.status not in {"canceled", "incomplete_expired"}:
                raise ConflictError("Payment is processing. Refresh billing before starting another checkout.")
        account.checkout_id = None
        account.checkout_key = uuid4()
        account.checkout_plan = None

    # Persist exact request parameters as well as the key before attempting the remote mutation.
    if account.checkout_plan is None:
        account.checkout_plan = plan
        account.checkout_quantity = max(1, await billing.seats(session, organization.id))

    # Commit the attempt key and revalidate after releasing the lock for the durable boundary.
    await session.commit()
    organization = await organizations.lock(session, organization.id)
    await organizations.locked_membership(session, user_id, organization.id, OrganizationRoles.owner)
    account = await session.get(BillingAccount, organization.id, populate_existing=True)
    if organization.deleted_at is not None or account is None:
        raise ForbiddenError("Organization unavailable")
    if await subscription(account, connection) is not None:
        raise ConflictError("Manage the existing subscription through the billing portal")
    if account.checkout_id is not None:
        existing = await connection.v1.checkout.sessions.retrieve_async(account.checkout_id)
        if existing.status == "open" and existing.url is not None:
            return existing.url
        raise ConflictError("Checkout already started. Refresh billing.")

    # The attempt fixes price and quantity across retries, even if membership changes after a remote crash.
    if account.checkout_plan is None:
        raise ConflictError("Checkout plan unavailable")
    price = await validate_price(connection, account.checkout_plan)
    hosted = await connection.v1.checkout.sessions.create_async(
        {
            "mode": "subscription",
            "customer": account.customer_id,
            "line_items": [{"price": price.id, "quantity": account.checkout_quantity}],
            "client_reference_id": str(organization.id),
            "payment_method_types": ["card"],
            "subscription_data": {"metadata": {"organization_id": str(organization.id)}},
            "success_url": f"{env.PUBLIC_URL}/orgs/{organization.slug}/settings#billing",
            "cancel_url": f"{env.PUBLIC_URL}/orgs/{organization.slug}/settings#billing",
        },
        options={"idempotency_key": f"checkout:{account.checkout_key}"},
    )
    account.checkout_id = hosted.id
    if account.checkout_plan != plan:
        # Recover a previous remote attempt before allowing a retry to choose a different plan.
        await session.commit()
        raise ConflictError("An earlier checkout was recovered. Retry to select your requested plan.")
    if hosted.url is None:
        raise UnavailableError("Checkout URL unavailable")
    return hosted.url


async def portal(session: AsyncSession, organization: Organization, connection: stripe.StripeClient) -> str:
    """Open a validated Portal with membership-owned quantities and end-of-period cancellation."""

    # Validate hosted controls before granting customers access to the configured Portal.
    configuration = await connection.v1.billing_portal.configurations.retrieve_async(env.STRIPE_PORTAL_CONFIGURATION_ID or "")
    features = configuration.features
    if (
        not configuration.active
        or not features.subscription_cancel.enabled
        or features.subscription_cancel.mode != "at_period_end"
        or features.subscription_update.enabled
    ):
        raise UnavailableError("Billing portal configuration permits unsupported subscription changes")

    # Customer mapping comes from the locked organization, never from the browser.
    account = await session.get(BillingAccount, organization.id)
    if account is None or account.customer_id is None:
        raise ConflictError("No billing customer exists yet")
    hosted = await connection.v1.billing_portal.sessions.create_async(
        {
            "customer": account.customer_id,
            "configuration": configuration.id,
            "return_url": f"{env.PUBLIC_URL}/orgs/{organization.slug}/settings#billing",
        }
    )
    return hosted.url


async def cancel(organization_id: UUID) -> None:
    """Expire checkout and cancel all customer subscriptions before organization resources are purged."""

    # Retain the customer mapping until Stripe confirms cancellation; failures leave the tombstone retryable.
    async with session_scope() as session:
        organization = await organizations.lock(session, organization_id)
        if organization.deleted_at is None:
            raise ForbiddenError("Active Organizations cannot be deleted by lifecycle cleanup")
        account = await session.get(BillingAccount, organization_id)
        if account is None or account.customer_id is None:
            return
        if account.status == "deleted":
            return
        async with billing.client() as connection:
            checkouts = await connection.v1.checkout.sessions.list_async({"customer": account.customer_id, "limit": 100})
            async for hosted in checkouts.auto_paging_iter():
                if hosted.status == "open":
                    await connection.v1.checkout.sessions.expire_async(hosted.id)
            subscriptions = await connection.v1.subscriptions.list_async({"customer": account.customer_id, "status": "all", "limit": 100})
            async for subscription in subscriptions.auto_paging_iter():
                if subscription.status not in {"canceled", "incomplete_expired"}:
                    await connection.v1.subscriptions.cancel_async(subscription.id)

        # Preserve confirmed cancellation while infrastructure cleanup retries; never restart billing on a tombstone.
        account.status = "deleted"
        account.plan = Plan.free
        account.subscription_id = None
        account.period_end = None
        account.payment_required = False
        account.cancel_at_period_end = False
        account.next_action_at = None
        await session.commit()


async def run() -> None:
    """Retry deletion cancellation and expire webhook deduplication."""

    # Disabled deployments never contact Stripe or require its configuration.
    if not env.BILLING_ENABLED:
        return
    while True:
        try:
            # Wake only deletion retries; active subscriptions never have scheduled billing work.
            async with session_scope() as session:
                result = await session.scalars(
                    select(col(BillingAccount.organization_id))
                    .join(Organization, col(Organization.id) == col(BillingAccount.organization_id))
                    .where(
                        col(Organization.deleted_at).is_not(None),
                        col(BillingAccount.status) != "deleted",
                        col(BillingAccount.customer_id).is_not(None),
                        col(BillingAccount.next_action_at) <= datetime.now(UTC),
                    )
                    .order_by(col(BillingAccount.next_action_at))
                    .limit(20)
                )
                organization_ids = result.all()

            # Organization locks serialize replicas and membership changes, not unrelated infrastructure jobs.
            for organization_id in organization_ids:
                try:
                    async with session_scope() as session:
                        organization = await organizations.lock(session, organization_id)
                        account = await session.get(BillingAccount, organization_id)
                        if account is None or account.next_action_at is None or account.next_action_at > datetime.now(UTC):
                            continue
                        if organization.deleted_at is None or account.status == "deleted":
                            continue

                    # Retry Stripe cancellation separately from the serial infrastructure worker after provider outages.
                    await cancel(organization_id)
                    async with session_scope() as session:
                        await operations.enqueue(session, kind=OperationKind.organization_delete, target_id=organization_id, coalesce=False)
                        await session.commit()
                except Exception:
                    logger.exception("Billing deadline handling failed organization_id=%s", organization_id)
                    async with session_scope() as session:
                        await session.execute(
                            update(BillingAccount)
                            .where(col(BillingAccount.organization_id) == organization_id)
                            .values(next_action_at=datetime.now(UTC) + timedelta(minutes=1))
                        )
                        await session.commit()

            # Retain event deduplication for thirty days, including deliveries for unknown customers.
            async with session_scope() as session:
                cutoff = datetime.now(UTC) - timedelta(days=30)
                await session.execute(delete(BillingEvent).where(col(BillingEvent.received_at) < cutoff))
                await session.commit()
        except Exception:
            logger.exception("Billing scheduler polling failed")

        # New work is picked up quickly; provider outages remain retryable without a tight loop.
        await asyncio.sleep(10)
