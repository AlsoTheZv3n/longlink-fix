import sqlalchemy as sa
from alembic import op

revision = "20261016_0007"
down_revision = "20261014_0006"
branch_labels = None
depends_on = None


def upgrade() -> None:
    """Retain image versions on new release snapshots."""

    # Leave historical versions unknown rather than querying external registries.
    with op.batch_alter_table("revisions") as batch:
        batch.add_column(sa.Column("version", sa.Text(), nullable=True))


def downgrade() -> None:
    """Remove recorded image versions."""

    # Preserve release snapshots while removing their version metadata.
    with op.batch_alter_table("revisions") as batch:
        batch.drop_column("version")
