import json
import pytest
import stripe
from uuid import UUID
from conftest import DatabaseKubernetes
from datetime import UTC, datetime
from factories import create_organization
from sqlalchemy import select
from urllib.parse import parse_qs, urlsplit
from src.operations import invoices
from src.environments import env
from src.models.statuses import Status
from src.database.session import session_scope
from src.models.organizations import DatabaseState
from src.database.models.users import User
from src.database.models.invoices import Invoice
from src.database.models.organizations import Organization


@pytest.mark.usefixtures("database_runtime")
@pytest.mark.parametrize("failed_measurement", ["database", "storage"])
async def test_snapshot_measurement_failure_preserves_deadline_until_complete_retry(
    users: tuple[User, User, User], monkeypatch: pytest.MonkeyPatch, failed_measurement: str
) -> None:
    """Never persist partial usage or skip a billing month when measurement fails."""

    # Arrange
    organization = await create_organization(users[0])
    period_end = datetime.now(UTC).replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    async with session_scope() as session:
        persisted = await session.get(Organization, organization.id)
        assert persisted is not None
        persisted.status = Status.running
        persisted.database_state = DatabaseState.available
        persisted.stripe_customer_id = "cus_usage"
        persisted.stripe_payment_method_id = "pm_usage"
        persisted.invoice_due_at = period_end
        await session.commit()

    async def database_usage(self: object, organization_id: UUID) -> int:
        """Measure external SQL usage, with one recoverable outage."""

        assert organization_id == organization.id
        if failed_measurement == "database":
            raise OSError("database measurement unavailable")
        return 100 * 1024**2 + 1024**3

    async def storage_usage(self: object, bucket: str) -> int:
        """Measure external S3 usage, with one recoverable outage."""

        assert bucket == invoices.Storage.bucket_name(organization.id)
        if failed_measurement == "storage":
            raise OSError("storage measurement unavailable")
        return 2 * 1024**3

    monkeypatch.setattr(invoices, "Kubernetes", DatabaseKubernetes)
    monkeypatch.setattr(invoices.databases.postgres.Postgres, "usage", database_usage, raising=False)
    monkeypatch.setattr(invoices.s3.S3, "usage", storage_usage)

    # Act
    with pytest.raises(OSError, match=f"{failed_measurement} measurement unavailable"):
        async with session_scope() as session:
            await invoices.snapshot(session, organization.id, period_end)

    # Assert
    async with session_scope() as session:
        result = await session.scalars(select(Invoice))
        assert result.all() == []
        persisted = await session.get(Organization, organization.id)
        assert persisted is not None
        assert persisted.invoice_due_at == period_end

    # Act
    failed_measurement = ""
    async with session_scope() as session:
        await invoices.snapshot(session, organization.id, period_end)
    async with session_scope() as session:
        await invoices.snapshot(session, organization.id, period_end)

    # Assert
    async with session_scope() as session:
        result = await session.scalars(select(Invoice))
        invoice = result.one()
        assert invoice.organization_id == organization.id
        assert invoice.customer_id == "cus_usage"
        assert invoice.period_end == period_end
        assert (invoice.users, invoice.database_bytes, invoice.storage_bytes) == (1, 100 * 1024**2 + 1024**3, 2 * 1024**3)
        assert (invoice.user_amount, invoice.database_amount, invoice.storage_amount) == (0, 100, 10)
        persisted = await session.get(Organization, organization.id)
        assert persisted is not None
        assert persisted.invoice_due_at == invoices.dates.next_month(period_end)


@pytest.mark.parametrize("crash_after", ["invoice", "item", "finalize"])
async def test_issue_recovers_remote_success_after_crash_without_duplicate_charges(
    monkeypatch: pytest.MonkeyPatch, crash_after: str
) -> None:
    """Recover remote side effects after local rollback, even without retained idempotency keys."""

    # Arrange
    invoice = Invoice(
        customer_id="cus_retry",
        period_end=datetime.now(UTC).replace(day=1, hour=0, minute=0, second=0, microsecond=0),
        users=7,
        database_bytes=100 * 1024**2 + 1024**3,
        storage_bytes=2 * 1024**3,
        user_amount=1000,
        database_amount=100,
        storage_amount=10,
    )
    async with session_scope() as session:
        session.add(invoice)
        await session.commit()

    remote_invoices: list[dict] = []
    remote_items: list[dict] = []
    finalized_totals: list[int] = []
    creations: list[str] = []
    monkeypatch.setattr(env, "STRIPE_SECRET_KEY", "sk_test_invoices")
    monkeypatch.setattr(env, "STRIPE_WEBHOOK_SECRET", "whsec_invoices")

    async def request(
        self: stripe.HTTPXClient, method: str, url: str, headers: object, post_data: str | None = None
    ) -> tuple[bytes, int, dict[str, str]]:
        """Emulate only Stripe HTTP, retaining remote effects across a lost response."""

        # Decode the real SDK's wire request; deliberately do not retain idempotency keys.
        path = urlsplit(url).path
        params = parse_qs(post_data or "")
        event = None
        if method == "get" and path == "/v1/invoices":
            assert parse_qs(urlsplit(url).query)["customer"] == ["cus_retry"]
            payload = {"object": "list", "data": remote_invoices, "has_more": False, "url": path}
        elif method == "post" and path == "/v1/invoices":
            assert params["customer"] == ["cus_retry"]
            assert params["pending_invoice_items_behavior"] == ["exclude"]
            remote = {
                "id": f"in_{len(remote_invoices) + 1}",
                "object": "invoice",
                "customer": params["customer"][0],
                "currency": params["currency"][0],
                "status": "draft",
                "metadata": {"longlink_invoice_id": params["metadata[longlink_invoice_id]"][0]},
                "total": 0,
            }
            remote_invoices.append(remote)
            creations.append("invoice")
            payload = remote
            event = "invoice"
        elif method == "get" and path == "/v1/invoiceitems":
            assert parse_qs(urlsplit(url).query)["invoice"] == ["in_1"]
            payload = {"object": "list", "data": remote_items, "has_more": False, "url": path}
        elif method == "post" and path == "/v1/invoiceitems":
            assert params["invoice"] == ["in_1"]
            item = {
                "id": f"ii_{len(remote_items) + 1}",
                "object": "invoiceitem",
                "amount": int(params["amount"][0]),
                "metadata": {
                    "longlink_invoice_id": params["metadata[longlink_invoice_id]"][0],
                    "resource": params["metadata[resource]"][0],
                },
            }
            remote_items.append(item)
            remote_invoices[0]["total"] += item["amount"]
            creations.append("item")
            payload = item
            event = "item"
        elif method == "get" and path == "/v1/invoices/in_1":
            payload = remote_invoices[0]
        elif method == "post" and path == "/v1/invoices/in_1/finalize":
            assert params["auto_advance"] == ["true"]
            remote_invoices[0]["status"] = "open"
            finalized_totals.append(remote_invoices[0]["total"])
            payload = remote_invoices[0]
            event = "finalize"
        else:
            raise AssertionError(f"Unexpected Stripe request: {method} {url}")

        # A remote success followed by process interruption must leave local issuance uncommitted.
        if event == crash_after:
            raise RuntimeError("process interrupted after Stripe success")
        return json.dumps(payload).encode(), 200, {}

    monkeypatch.setattr(stripe.HTTPXClient, "request_async", request)

    # Act
    with pytest.raises(RuntimeError, match="process interrupted after Stripe success"):
        async with session_scope() as session:
            await invoices.issue(session, invoice.id)

    # Assert
    async with session_scope() as session:
        persisted = await session.get(Invoice, invoice.id)
        assert persisted is not None
        assert persisted.issued_at is None
        assert persisted.stripe_invoice_id is None
    assert len(remote_invoices) == 1

    # Act
    crash_after = ""
    async with session_scope() as session:
        await invoices.issue(session, invoice.id)
    async with session_scope() as session:
        await invoices.issue(session, invoice.id)

    # Assert
    async with session_scope() as session:
        persisted = await session.get(Invoice, invoice.id)
        assert persisted is not None
        assert persisted.stripe_invoice_id == "in_1"
        assert persisted.issued_at is not None
    assert creations == ["invoice", "item", "item", "item"]
    assert finalized_totals == [1110]
    assert [(item["metadata"]["resource"], item["amount"]) for item in remote_items] == [
        ("users", 1000),
        ("database", 100),
        ("storage", 10),
    ]
    assert all(item["metadata"]["longlink_invoice_id"] == str(invoice.id) for item in remote_items)
