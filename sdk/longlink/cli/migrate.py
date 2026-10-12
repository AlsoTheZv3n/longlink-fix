from longlink.database.migrations import make_migrations, apply_migrations


def migrate_command() -> None:
    """Generate and apply database migrations for the current Solution."""

    # Bring the database current before generating a new metadata revision.
    apply_migrations()

    # Apply the generated migration only when Alembic detected schema changes.
    if make_migrations():
        apply_migrations()
        print("Migrations generated and applied successfully.")
        return

    print("No migrations were created because no schema changes were detected.")
