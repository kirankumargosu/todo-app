"""Database initialization utilities.

Provides a one-time script to create tables (if missing) and optionally seed default users.
Usage:
  python -m app.utils.init_db
  python -m app.utils.init_db --seed-users
"""

import logging
import argparse

from app.db.database import Base, engine

# Ensure model modules are imported so their metadata is registered on Base
# (this is safe even if imported multiple times)
import app.models.user_model  # noqa: F401
import app.models.task_model  # noqa: F401

logger = logging.getLogger(__name__)


def create_tables() -> None:
    """Create all tables defined on SQLAlchemy Base (no-op if they already exist)."""
    logger.info("Creating database tables (if not present)...")
    Base.metadata.create_all(bind=engine)
    logger.info("Database tables created / verified.")


def autoupgrade() -> None:
    """Attempt a safe, non-destructive schema upgrade.

    Current capabilities (safe by default):
    - Create missing tables (delegates to create_all)
    - Add missing columns to existing tables using ALTER TABLE ADD COLUMN
      (only adds column as NULLABLE if the model requires NOT NULL and no default value)

    Note: This is intended for simple schema changes (adding columns). More complex
    migrations (renames, type changes, column drops) should use Alembic migrations.
    """
    from sqlalchemy import inspect

    inspector = inspect(engine)
    existing_tables = set(inspector.get_table_names())

    # 1) Create any entirely missing tables
    missing_tables = [t for t in Base.metadata.tables.values() if t.name not in existing_tables]
    if missing_tables:
        logger.info("Creating missing tables: %s", [t.name for t in missing_tables])
        Base.metadata.create_all(bind=engine, tables=missing_tables)
    else:
        logger.info("No missing tables to create.")

    # 2) For existing tables, add missing columns where safe
    for table in Base.metadata.sorted_tables:
        name = table.name
        if name not in existing_tables:
            # Already handled by create_all above
            continue

        existing_cols = {c['name'] for c in inspector.get_columns(name)}
        for col in table.columns:
            if col.name in existing_cols:
                continue

            # Determine SQL type string
            try:
                col_type = col.type.compile(dialect=engine.dialect)
            except Exception:
                col_type = str(col.type)

            # Decide NULL/NOT NULL and DEFAULT handling
            nullable = col.nullable
            default_sql = None
            if col.default is not None:
                # Try to extract a scalar default
                try:
                    arg = col.default.arg
                    if callable(arg):
                        arg = None
                    default_sql = arg
                except Exception:
                    default_sql = None

            # If NOT NULL and no default, we'll add column as nullable to avoid failing
            if not nullable and default_sql is None:
                logger.warning("Column '%s.%s' is NOT NULL with no default; adding as NULLABLE to avoid data loss.", name, col.name)
                nullable = True

            parts = [f'ALTER TABLE "{name}" ADD COLUMN "{col.name}" {col_type}']
            if not nullable:
                parts.append("NOT NULL")
            if default_sql is not None:
                # Quote strings
                if isinstance(default_sql, str):
                    parts.append(f"DEFAULT '{default_sql}'")
                else:
                    parts.append(f"DEFAULT {default_sql}")

            sql = " ".join(parts)

            logger.info("Adding column to table %s: %s", name, sql)
            try:
                from sqlalchemy import text
                # use a BEGIN block so DDL is committed immediately and compatible with 1.4+ engines
                with engine.begin() as conn:
                    conn.execute(text(sql))
                logger.info("Successfully added column %s.%s", name, col.name)
            except Exception:
                logger.exception("Failed to add column %s.%s", name, col.name)

    logger.info("Autoupgrade complete. For complex migrations use Alembic.")


def main() -> None:
    """Create tables and exit. Kept simple on purpose.

    Run: python -m app.utils.init_db
    """
    create_tables()


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(name)s: %(message)s")
    main()
