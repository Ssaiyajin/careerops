from datetime import datetime, timedelta, timezone

from sqlalchemy.orm import Session

from app.core.config import settings
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


def purge_expired_resume_analyses(retention_days: int | None = None) -> int:
    days = retention_days if retention_days is not None else settings.resume_retention_days
    cutoff = datetime.now(timezone.utc).replace(tzinfo=None) - timedelta(days=days)

    with Session(bind=engine) as db:
        deleted_count = (
            db.query(ResumeAnalysis)
            .filter(ResumeAnalysis.created_at < cutoff)
            .delete(synchronize_session=False)
        )
        db.commit()
        return deleted_count
