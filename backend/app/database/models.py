from sqlalchemy import (
    Column,
    Float,
    ForeignKey,
    Integer,
    Index,
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


class ApiUsageEvent(Base):
    __tablename__ = "api_usage_events"

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    operation = Column(String(32), nullable=False)
    units = Column(Integer, nullable=False, default=1)
    created_at_epoch = Column(Float, nullable=False)

    __table_args__ = (
        Index("ix_api_usage_user_operation_time", "user_id", "operation", "created_at_epoch"),
    )
