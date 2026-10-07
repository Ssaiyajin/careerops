import os
from sqlalchemy import create_engine

DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    raise RuntimeError(
        "DATABASE_URL is not set. Point it at a Postgres instance, "
        "e.g. a free tier on Supabase/Neon, or configure it in the "
        "selected backend/.env profile."
    )

engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True
)