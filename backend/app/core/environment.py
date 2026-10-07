import os
import subprocess
from collections.abc import MutableMapping
from pathlib import Path

from dotenv import dotenv_values


_ENV_PROFILES = {
    "dev": "dev",
    "development": "dev",
    "prod": "prod",
    "production": "prod",
    "main": "prod",
}


def _git_branch(repository_root: Path) -> str | None:
    try:
        result = subprocess.run(
            ["git", "-C", str(repository_root), "branch", "--show-current"],
            capture_output=True,
            check=False,
            text=True,
            timeout=2,
        )
    except FileNotFoundError:
        return None

    if result.returncode != 0:
        return None
    branch = result.stdout.strip().lower()
    return branch or None


def load_environment_profile(
    environ: MutableMapping[str, str] | None = None,
    env_directory: Path | None = None,
) -> str:
    target_environment = os.environ if environ is None else environ
    directory = (
        env_directory
        if env_directory is not None
        else Path(__file__).resolve().parents[2]
    )
    env_file = directory / ".env"
    file_values = dotenv_values(env_file) if env_file.is_file() else {}

    requested_profile = target_environment.get("APP_ENV")
    if not requested_profile:
        requested_profile = target_environment.get("RENDER_GIT_BRANCH")
    if not requested_profile and env_directory is None:
        requested_profile = _git_branch(Path(__file__).resolve().parents[3])
    if not requested_profile:
        requested_profile = file_values.get("APP_ENV", "dev")
    requested_profile = requested_profile.strip().lower()

    try:
        profile = _ENV_PROFILES[requested_profile]
    except KeyError as error:
        raise RuntimeError(
            "Select the 'dev' or 'main' branch with APP_ENV "
            "(also accepts 'development', 'prod', or 'production')."
        ) from error

    target_environment.setdefault("APP_ENV", profile)
    profile_prefix = "PROD_" if profile == "prod" else "DEV_"
    for key, value in file_values.items():
        if key.startswith(profile_prefix) and value is not None:
            target_environment.setdefault(key[len(profile_prefix):], value)

    return profile
