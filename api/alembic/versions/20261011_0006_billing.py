"""Add organization subscription snapshots and durable webhook deduplication."""

import sqlalchemy as sa
from alembic import op
from sqlmodel.sql.sqltypes import UTCDateTime

revision = "20261011_0006"
down_revision = "20261009_0005"
branch_labels = None
depends_on = None


def upgrade() -> None:
    """Add opt-in billing without changing existing organizations."""

    # Keep one customer and subscription per organization.
    op.create_table(
        "billing_accounts",
        sa.Column("organization_id", sa.Uuid(), sa.ForeignKey("organizations.id", ondelete="CASCADE"), primary_key=True),
        sa.Column("customer_id", sa.String(255), unique=True),
        sa.Column("plan", sa.Enum("free", "team", native_enum=False), nullable=False),
        sa.Column("status", sa.String(64), nullable=False),
        sa.Column("subscription_id", sa.String(255), unique=True),
        sa.Column("period_end", UTCDateTime()),
        sa.Column("payment_required", sa.Boolean(), nullable=False),
        sa.Column("cancel_at_period_end", sa.Boolean(), nullable=False),
        sa.Column("checkout_key", sa.Uuid(), nullable=False),
        sa.Column("checkout_id", sa.String(255)),
        sa.Column("checkout_plan", sa.Enum("free", "team", native_enum=False)),
        sa.Column("checkout_quantity", sa.Integer(), nullable=False),
        sa.Column("next_action_at", UTCDateTime()),
    )
    op.create_index("ix_billing_accounts_next_action_at", "billing_accounts", ["next_action_at"])

    # Retain only verified event identifiers and their receipt timestamps.
    op.create_table(
        "billing_events",
        sa.Column("id", sa.String(255), primary_key=True),
        sa.Column("received_at", UTCDateTime(), nullable=False),
    )


def downgrade() -> None:
    """Remove billing persistence without changing membership or infrastructure."""

    # Remove event deduplication before subscription snapshots.
    op.drop_table("billing_events")
    op.drop_table("billing_accounts")
