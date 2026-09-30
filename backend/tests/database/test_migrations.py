from pathlib import Path

from alembic import command
from alembic.config import Config
from sqlalchemy import create_engine, inspect, text

from app.database.models import Base, ResumeAnalysis, User


def test_initial_migration_creates_current_schema():
    test_engine = create_engine("sqlite://")
    connection = test_engine.connect()
    config = Config(str(Path(__file__).resolve().parents[2] / "alembic.ini"))
    config.attributes["connection"] = connection

    try:
        command.upgrade(config, "head")
        tables = set(inspect(connection).get_table_names())
        assert {"users", "resume_analysis", "api_usage_events", "alembic_version"} <= tables
    finally:
        connection.close()
        test_engine.dispose()


def test_initial_migration_preserves_legacy_create_all_tables():
    test_engine = create_engine("sqlite://")
    Base.metadata.create_all(
        bind=test_engine,
        tables=[User.__table__, ResumeAnalysis.__table__],
    )
    with test_engine.begin() as connection:
        user_id = connection.execute(
            User.__table__.insert().values(
                email="legacy@example.com",
                hashed_password="unused",
            )
        ).inserted_primary_key[0]
        connection.execute(
            ResumeAnalysis.__table__.insert().values(
                user_id=user_id,
                resume_text="existing resume",
            )
        )

    connection = test_engine.connect()
    config = Config(str(Path(__file__).resolve().parents[2] / "alembic.ini"))
    config.attributes["connection"] = connection

    try:
        command.upgrade(config, "head")
        tables = set(inspect(connection).get_table_names())
        assert "api_usage_events" in tables
        assert connection.execute(
            text("SELECT resume_text FROM resume_analysis")
        ).scalar_one() == "existing resume"
    finally:
        connection.close()
        test_engine.dispose()
