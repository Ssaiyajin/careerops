from pathlib import Path

from alembic import command
from alembic.config import Config

from app.database.db import engine


def upgrade_database_schema() -> None:
    backend_root = Path(__file__).resolve().parents[2]
    config = Config(str(backend_root / "alembic.ini"))

    with engine.begin() as connection:
        config.attributes["connection"] = connection
        command.upgrade(config, "head")
