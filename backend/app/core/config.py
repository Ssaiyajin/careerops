"""
Centralized backend configuration, read from environment variables so
the same code works locally, in Docker, and on the OCI deployment.
See backend/.env.example for the full list of supported variables.
"""

import json
import os


class Settings:
    upload_dir: str = os.getenv("UPLOAD_DIR", "uploads")
    export_dir: str = os.getenv("EXPORT_DIR", "exports")

    # Reject uploads bigger than this before they're even written to
    # disk — an unbounded upload size is a resource-exhaustion vector.
    max_upload_size_mb: int = int(os.getenv("MAX_UPLOAD_SIZE_MB", "10"))

    # Target skills for job matching (configurable via environment)
    # Can be JSON array or comma-separated string
    _target_skills_env = os.getenv("TARGET_SKILLS", "")
    if _target_skills_env:
        try:
            target_skills: list[str] = json.loads(_target_skills_env)
        except json.JSONDecodeError:
            # Fall back to comma-separated parsing
            target_skills: list[str] = [
                s.strip() for s in _target_skills_env.split(",") if s.strip()
            ]
    else:
        # Default DevOps-focused skills
        target_skills: list[str] = [
            "Python",
            "Docker",
            "Kubernetes",
            "Terraform",
            "AWS",
            "CI/CD",
            "FastAPI",
        ]

    # JWT Configuration
    jwt_expiration_minutes: int = int(os.getenv("JWT_EXPIRATION_MINUTES", "60"))


settings = Settings()
