from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.db import engine
from app.database.models import ResumeAnalysis, User
from app.auth.dependencies import get_current_user

router = APIRouter()


@router.get("/history")
def get_history(current_user: User = Depends(get_current_user)):

    db = Session(bind=engine)

    try:
        analyses = (
            db.query(ResumeAnalysis)
            .filter(ResumeAnalysis.user_id == current_user.id)
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

        return results
    finally:
        db.close()
