import pytest

from app.core.environment import load_environment_profile


def test_loads_dev_profile_without_overriding_platform_environment(tmp_path):
    (tmp_path / ".env").write_text(
        "APP_ENV=dev\n"
        "DEV_DATABASE_URL=dev-database\n"
        "DEV_JWT_SECRET_KEY=dev-secret\n"
        "PROD_DATABASE_URL=prod-database\n",
        encoding="utf-8",
    )
    environment = {
        "APP_ENV": "development",
        "JWT_SECRET_KEY": "platform-dev-secret",
    }

    profile = load_environment_profile(environment, tmp_path)

    assert profile == "dev"
    assert environment["APP_ENV"] == "development"
    assert environment["DATABASE_URL"] == "dev-database"
    assert environment["JWT_SECRET_KEY"] == "platform-dev-secret"
    assert "PROD_DATABASE_URL" not in environment


def test_loads_main_branch_profile_without_falling_back_to_dev(tmp_path):
    (tmp_path / ".env").write_text(
        "APP_ENV=dev\n"
        "DEV_DATABASE_URL=dev-database\n"
        "PROD_DATABASE_URL=prod-database\n",
        encoding="utf-8",
    )
    environment = {"APP_ENV": "main"}

    profile = load_environment_profile(environment, tmp_path)

    assert profile == "prod"
    assert environment["APP_ENV"] == "main"
    assert environment["DATABASE_URL"] == "prod-database"


def test_render_branch_selects_environment_when_app_env_is_not_set(tmp_path):
    (tmp_path / ".env").write_text(
        "APP_ENV=dev\n"
        "DEV_DATABASE_URL=dev-database\n"
        "PROD_DATABASE_URL=prod-database\n",
        encoding="utf-8",
    )
    environment = {"RENDER_GIT_BRANCH": "main"}

    profile = load_environment_profile(environment, tmp_path)

    assert profile == "prod"
    assert environment["APP_ENV"] == "prod"
    assert environment["DATABASE_URL"] == "prod-database"


def test_rejects_unknown_environment_profile():
    with pytest.raises(RuntimeError, match="APP_ENV"):
        load_environment_profile({"APP_ENV": "staging"})
