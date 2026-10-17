import stripe
import asyncio
import contextlib
from src.errors import UnavailableError
from src.logger import logger
from collections.abc import AsyncGenerator
from src.environments import env


@contextlib.asynccontextmanager
async def client() -> AsyncGenerator[stripe.StripeClient]:
    """Own a bounded Stripe transport without modifying global SDK state."""

    # Unconfigured deployments cannot create customers or issue invoices.
    if not env.stripe_enabled or env.STRIPE_SECRET_KEY is None:
        raise UnavailableError("Stripe is not configured on this deployment")
    transport = stripe.HTTPXClient(
        timeout=10,
    )
    connection = stripe.StripeClient(
        env.STRIPE_SECRET_KEY,
        http_client=transport,
        max_network_retries=2,
    )

    try:
        # Retries remain bounded and shutdown cancellation releases the transport.
        async with asyncio.timeout(60):
            yield connection
    except (stripe.StripeError, TimeoutError) as exc:
        logger.warning("Stripe request failed: %s", type(exc).__name__)
        raise UnavailableError("Payment provider unavailable. Please try again.") from None
    finally:
        await transport.close_async()
