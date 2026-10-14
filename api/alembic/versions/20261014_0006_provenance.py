"""Remove original image-reference provenance from release snapshots."""

import sqlalchemy as sa
from alembic import op

revision = "20261014_0006"
down_revision = "20261009_0005"
branch_labels = None
depends_on = None


def upgrade() -> None:
    """Discard submitted references while retaining immutable deployment images."""

    # Existing installations lose original tags and digests; back up provenance before upgrading if needed.
    with op.batch_alter_table("revisions") as batch:
        batch.drop_column("source")


def downgrade() -> None:
    """Restore the column using immutable images, not unrecoverable original references."""

    # Backfill retained snapshots before restoring the previous non-null contract.
    with op.batch_alter_table("revisions") as batch:
        batch.add_column(sa.Column("source", sa.String(512), nullable=True))
    revisions = sa.table("revisions", sa.column("source", sa.String(512)), sa.column("image", sa.String(512)))
    op.execute(revisions.update().values(source=revisions.c.image))
    with op.batch_alter_table("revisions") as batch:
        batch.alter_column("source", existing_type=sa.String(512), nullable=False)
