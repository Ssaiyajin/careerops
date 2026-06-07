from sqlalchemy import (
    Column,
    Integer,
    String,
    Text,
    DateTime
)

from sqlalchemy.orm import declarative_base

from datetime import datetime

Base = declarative_base()

class ResumeAnalysis(Base):

    __tablename__ = "resume_analysis"

    id = Column(Integer, primary_key=True)

    candidate_name = Column(String)

    email = Column(String)

    ats_score = Column(Integer)

    match_score = Column(Integer)

    experience_level = Column(String)

    resume_text = Column(Text)

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )