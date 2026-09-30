from sqlalchemy.orm import Session

from app.database.db import engine
from app.database.models import ApiUsageEvent, ResumeAnalysis, User


def get_user_by_email(email: str):
    db = Session(bind=engine)
    try:
        return db.query(User).filter(User.email == email).first()
    finally:
        db.close()


def create_user(email: str, hashed_password: str):
    db = Session(bind=engine)
    try:
        user = User(email=email, hashed_password=hashed_password)
        db.add(user)
        db.commit()
        db.refresh(user)
        return user
    finally:
        db.close()


def delete_user_account(user_id: int) -> None:
    db = Session(bind=engine)
    try:
        db.query(ResumeAnalysis).filter(
            ResumeAnalysis.user_id == user_id
        ).delete(synchronize_session=False)
        db.query(ApiUsageEvent).filter(
            ApiUsageEvent.user_id == user_id
        ).delete(synchronize_session=False)
        db.query(User).filter(User.id == user_id).delete(
            synchronize_session=False
        )
        db.commit()
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()
