import os
from dotenv import load_dotenv
from sqlalchemy import create_engine

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    raise RuntimeError(
        "DATABASE_URL is not set. Point it at a Postgres instance, "
        "e.g. a free tier on Supabase/Neon, or a local one for dev "
        "(see backend/.env.example)."
    )

engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True
)