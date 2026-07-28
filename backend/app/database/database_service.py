from sqlalchemy.orm import Session

from app.database.db import engine
from app.database.models import ResumeAnalysis


def save_resume_analysis(
    candidate_name,
    email,
    ats_score,
    match_score,
    experience_level,
    resume_text,
    user_id=None,
):
    db = Session(bind=engine)

    analysis = ResumeAnalysis(
        user_id=user_id,
        candidate_name=candidate_name,
        email=email,
        ats_score=ats_score,
        match_score=match_score,
        experience_level=experience_level,
        resume_text=resume_text
    )

    db.add(analysis)
    db.commit()
    db.refresh(analysis)

    db.close()

    return analysis
