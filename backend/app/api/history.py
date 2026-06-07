import email

from fastapi import APIRouter
from sqlalchemy.orm import Session

from app.database.db import engine
from app.database.models import ResumeAnalysis

router = APIRouter()

@router.get("/history")
def get_history():

    db = Session(bind=engine)

    analyses = (
        db.query(ResumeAnalysis)
        .order_by(ResumeAnalysis.id.desc())
        .all()
    )

    results = []

    for item in analyses:
        results.append({
            "id": item.id,
            "candidate_name": item.candidate_name,
            "email": item.email,
            "ats_score": item.ats_score,
            "match_score": item.match_score,
            "experience_level": item.experience_level,
            "created_at": str(item.created_at)
        })

    db.close()

    return results