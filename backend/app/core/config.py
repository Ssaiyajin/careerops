"""
Centralized backend configuration, read from environment variables so
the same code works locally, in Docker, and on the OCI deployment.
See backend/.env.example for the full list of supported variables.
"""

import os


class Settings:
    upload_dir: str = os.getenv("UPLOAD_DIR", "uploads")
    export_dir: str = os.getenv("EXPORT_DIR", "exports")

    # Reject uploads bigger than this before they're even written to
    # disk — an unbounded upload size is a resource-exhaustion vector.
    max_upload_size_mb: int = int(os.getenv("MAX_UPLOAD_SIZE_MB", "10"))


settings = Settings()
