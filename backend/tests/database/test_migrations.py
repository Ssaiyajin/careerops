from pathlib import Path

from alembic import command
from alembic.config import Config
from sqlalchemy import create_engine, inspect, text

from app.database import migrations as migration_service
from app.database.models import Base, ResumeAnalysis, User


def test_initial_migration_creates_current_schema():
    test_engine = create_engine("sqlite://")
    connection = test_engine.connect()
    config = Config(str(Path(__file__).resolve().parents[2] / "alembic.ini"))
    config.attributes["connection"] = connection

    try:
        command.upgrade(config, "head")
        tables = set(inspect(connection).get_table_names())
        assert {
            "users",
            "resume_analysis",
            "api_usage_events",
            "password_reset_tokens",
            "alembic_version",
        } <= tables
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


def test_migration_adds_missing_resume_owner_column_without_losing_data():
    test_engine = create_engine("sqlite://")
    with test_engine.begin() as connection:
        connection.execute(
            text(
                """
                CREATE TABLE users (
                    id INTEGER PRIMARY KEY,
                    email VARCHAR NOT NULL UNIQUE,
                    hashed_password VARCHAR NOT NULL,
                    created_at DATETIME
                )
                """
            )
        )
        connection.execute(
            text(
                """
                CREATE TABLE resume_analysis (
                    id INTEGER PRIMARY KEY,
                    candidate_name VARCHAR,
                    email VARCHAR,
                    ats_score INTEGER,
                    match_score INTEGER,
                    experience_level VARCHAR,
                    resume_text TEXT,
                    created_at DATETIME
                )
                """
            )
        )
        connection.execute(
            text(
                "INSERT INTO resume_analysis (candidate_name, resume_text) "
                "VALUES ('Legacy Candidate', 'Existing resume data')"
            )
        )

    connection = test_engine.connect()
    config = Config(str(Path(__file__).resolve().parents[2] / "alembic.ini"))
    config.attributes["connection"] = connection

    try:
        command.upgrade(config, "head")
        columns = {column["name"] for column in inspect(connection).get_columns("resume_analysis")}
        indexes = {index["name"] for index in inspect(connection).get_indexes("resume_analysis")}

        assert "user_id" in columns
        assert "ix_resume_analysis_user_id" in indexes
        assert connection.execute(
            text("SELECT resume_text FROM resume_analysis")
        ).scalar_one() == "Existing resume data"
    finally:
        connection.close()
        test_engine.dispose()


def test_application_migration_runner_upgrades_existing_schema(monkeypatch):
    test_engine = create_engine("sqlite://")
    with test_engine.begin() as connection:
        connection.execute(
            text(
                """
                CREATE TABLE users (
                    id INTEGER PRIMARY KEY,
                    email VARCHAR NOT NULL UNIQUE,
                    hashed_password VARCHAR NOT NULL,
                    created_at DATETIME
                )
                """
            )
        )
        connection.execute(
            text(
                """
                CREATE TABLE resume_analysis (
                    id INTEGER PRIMARY KEY,
                    candidate_name VARCHAR,
                    email VARCHAR,
                    ats_score INTEGER,
                    match_score INTEGER,
                    experience_level VARCHAR,
                    resume_text TEXT,
                    created_at DATETIME
                )
                """
            )
        )

    monkeypatch.setattr(migration_service, "engine", test_engine)
    try:
        migration_service.upgrade_database_schema()

        columns = {
            column["name"]
            for column in inspect(test_engine).get_columns("resume_analysis")
        }
        assert "user_id" in columns
    finally:
        test_engine.dispose()
