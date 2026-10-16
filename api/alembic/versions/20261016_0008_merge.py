revision = "20261016_0008"
down_revision = ("20261011_0006", "20261016_0007")
branch_labels = None
depends_on = None


def upgrade() -> None:
    """Merge billing and release metadata migration histories."""

    pass


def downgrade() -> None:
    """Restore the independent migration heads."""

    pass
