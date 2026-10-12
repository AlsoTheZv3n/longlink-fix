from alembic import context
from sqlalchemy.engine import Connection

config = context.config

# Select configuration without changing ownership of the online connection.
if context.is_offline_mode():
    # Configure SQL generation without opening a database connection.
    database_url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=database_url,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
        version_table_schema="shared",
    )
else:
    # The async SDK runner supplies the synchronous view of its own connection.
    connection = config.attributes.get("connection")
    if connection is None:
        raise RuntimeError("Online shared migrations require a supplied SQLAlchemy Connection")
    if not isinstance(connection, Connection):
        raise TypeError("Alembic connection must be a SQLAlchemy Connection")

    # Alembic creates its version table before revisions, so configure the target schema first.
    context.configure(connection=connection, version_table_schema="shared")

# Bootstrap the schema and apply revisions in one transaction in either execution mode.
with context.begin_transaction():
    context.execute("CREATE SCHEMA IF NOT EXISTS shared")
    context.execute("SET search_path TO shared")
    context.run_migrations()
