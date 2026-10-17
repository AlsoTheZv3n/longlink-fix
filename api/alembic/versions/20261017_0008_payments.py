"""Attach Stripe customers to Organizations and retain immutable monthly invoices."""

import sqlalchemy as sa
from alembic import op
from sqlmodel.sql.sqltypes import UTCDateTime

revision = "20261017_0008"
down_revision = "20261016_0007"
branch_labels = None
depends_on = None


def upgrade() -> None:
    """Add direct payment ownership and retry-safe month-end snapshots."""

    # Payment fields remain empty until card registration begins.
    with op.batch_alter_table("organizations") as batch:
        batch.add_column(sa.Column("stripe_customer_id", sa.String(255), nullable=True))
        batch.add_column(sa.Column("stripe_checkout_id", sa.String(255), nullable=True))
        batch.add_column(sa.Column("stripe_checkout_key", sa.Uuid(), nullable=True))
        batch.add_column(sa.Column("stripe_payment_method_id", sa.String(255), nullable=True))
        batch.add_column(sa.Column("invoice_due_at", UTCDateTime(), nullable=True))
        batch.create_unique_constraint("uq_organizations_stripe_customer_id", ["stripe_customer_id"])
        batch.create_index("ix_organizations_invoice_due_at", ["invoice_due_at"])

    # Retain charge snapshots if their Organization is later removed.
    op.create_table(
        "invoices",
        sa.Column("id", sa.Uuid(), primary_key=True),
        sa.Column("customer_id", sa.String(255), nullable=False),
        sa.Column("organization_id", sa.Uuid(), sa.ForeignKey("organizations.id", ondelete="SET NULL")),
        sa.Column("stripe_invoice_id", sa.String(255), unique=True),
        sa.Column("issued_at", UTCDateTime()),
        sa.Column("period_end", UTCDateTime(), nullable=False),
        sa.Column("measured_at", UTCDateTime(), nullable=False),
        sa.Column("users", sa.Integer(), nullable=False),
        sa.Column("user_amount", sa.Integer(), nullable=False),
        sa.Column("storage_bytes", sa.BigInteger(), nullable=False),
        sa.Column("database_bytes", sa.BigInteger(), nullable=False),
        sa.Column("storage_amount", sa.Integer(), nullable=False),
        sa.Column("database_amount", sa.Integer(), nullable=False),
        sa.UniqueConstraint("organization_id", "period_end", name="uq_invoices_organization_period"),
    )
    op.create_index("ix_invoices_organization_id", "invoices", ["organization_id"])


def downgrade() -> None:
    """Remove payment state without changing Organization infrastructure."""

    op.drop_table("invoices")
    with op.batch_alter_table("organizations") as batch:
        batch.drop_index("ix_organizations_invoice_due_at")
        batch.drop_constraint("uq_organizations_stripe_customer_id", type_="unique")
        batch.drop_column("invoice_due_at")
        batch.drop_column("stripe_payment_method_id")
        batch.drop_column("stripe_checkout_key")
        batch.drop_column("stripe_checkout_id")
        batch.drop_column("stripe_customer_id")
