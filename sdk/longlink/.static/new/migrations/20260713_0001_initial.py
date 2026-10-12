import sqlalchemy as sa
import sqlmodel.sql.sqltypes
from alembic import op

revision = "20260713_0001"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    """Apply the initial item schema and populate demo invoices once."""

    # Create the Solution-owned item table.
    op.create_table(
        "item",
        sa.Column("created_at", sqlmodel.sql.sqltypes.UTCDateTime(), nullable=True),
        sa.Column("updated_at", sqlmodel.sql.sqltypes.UTCDateTime(), nullable=True),
        sa.Column("deleted_at", sqlmodel.sql.sqltypes.UTCDateTime(), nullable=True),
        sa.Column("created_id", sa.Uuid(), nullable=True),
        sa.Column("updated_id", sa.Uuid(), nullable=True),
        sa.Column("deleted_id", sa.Uuid(), nullable=True),
        sa.Column("approved_by_id", sa.Uuid(), nullable=True),
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("name", sa.String(length=255), nullable=False),
        sa.Column("price", sa.Float(), nullable=False),
        sa.Column(
            "status",
            sa.Enum(
                "draft", "pending", "approved", name="invoice_status", native_enum=False
            ),
            server_default="draft",
            nullable=False,
        ),
        sa.ForeignKeyConstraint(["created_id"], ["audit.id"]),
        sa.ForeignKeyConstraint(["updated_id"], ["audit.id"]),
        sa.ForeignKeyConstraint(["deleted_id"], ["audit.id"]),
        sa.ForeignKeyConstraint(
            ["approved_by_id"], ["audit.id"], name="item_approved_by_id_fkey"
        ),
        sa.PrimaryKeyConstraint("id"),
    )

    # Seed only the newly created table; Alembic records this revision so restarts never restore demo data.
    items = sa.table(
        "item",
        sa.column("name", sa.String()),
        sa.column("price", sa.Float()),
        sa.column("status", sa.String()),
    )
    op.bulk_insert(
        items,
        [
            {"name": "Website redesign", "price": 4800.00, "status": "draft"},
            {"name": "Office supplies", "price": 186.50, "status": "pending"},
            {"name": "Cloud hosting", "price": 249.00, "status": "approved"},
            {"name": "Product photography", "price": 1250.00, "status": "pending"},
            {"name": "Team training workshop", "price": 1800.00, "status": "draft"},
            {"name": "Software licenses", "price": 599.00, "status": "approved"},
            {"name": "Equipment maintenance", "price": 340.75, "status": "pending"},
            {"name": "Customer research", "price": 2100.00, "status": "draft"},
            {"name": "Courier delivery", "price": 42.90, "status": "approved"},
            {"name": "Marketing campaign", "price": 3250.00, "status": "pending"},
            {"name": "Workspace rental", "price": 950.00, "status": "approved"},
            {"name": "Initial consultation", "price": 0.00, "status": "draft"},
        ],
    )


def downgrade() -> None:
    """Remove the initial item schema."""

    # Remove the Solution-owned item table.
    op.drop_table("item")
