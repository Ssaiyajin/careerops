from sqlalchemy import (
    Column,
    Integer,
    String,
    Text,
    DateTime
)

from sqlalchemy.orm import declarative_base

from datetime import datetime, timezone

Base = declarative_base()


class User(Base):

    __tablename__ = "users"

    id = Column(Integer, primary_key=True)

    email = Column(String, unique=True, index=True, nullable=False)

    hashed_password = Column(String, nullable=False)

    created_at = Column(
        DateTime,
        default=lambda: datetime.now(timezone.utc)
    )


class ResumeAnalysis(Base):

    __tablename__ = "resume_analysis"

    id = Column(Integer, primary_key=True)

    # Owning user — history is now scoped per-user rather than global.
    user_id = Column(Integer, index=True, nullable=True)

    candidate_name = Column(String)

    email = Column(String)

    ats_score = Column(Integer)

    match_score = Column(Integer)

    experience_level = Column(String)

    resume_text = Column(Text)

    created_at = Column(
        DateTime,
        default=lambda: datetime.now(timezone.utc)
    )
