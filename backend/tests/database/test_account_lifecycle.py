from sqlalchemy import create_engine
from sqlalchemy.orm import Session

from app.auth import database as auth_database
from app.database.models import ApiUsageEvent, Base, ResumeAnalysis, User


def test_delete_user_account_removes_user_data(monkeypatch):
    test_engine = create_engine("sqlite://")
    Base.metadata.create_all(bind=test_engine)
    with Session(bind=test_engine) as db:
        user = User(email="delete-test@example.com", hashed_password="unused")
        db.add(user)
        db.flush()
        user_id = user.id
        db.add(
            ResumeAnalysis(
                user_id=user_id,
                resume_text="private resume text",
            )
        )
        db.add(
            ApiUsageEvent(
                user_id=user_id,
                operation="generation",
                units=1,
                created_at_epoch=1,
            )
        )
        db.commit()

    monkeypatch.setattr(auth_database, "engine", test_engine)
    auth_database.delete_user_account(user_id)

    with Session(bind=test_engine) as db:
        assert db.query(User).filter(User.id == user_id).count() == 0
        assert db.query(ResumeAnalysis).filter(
            ResumeAnalysis.user_id == user_id
        ).count() == 0
        assert db.query(ApiUsageEvent).filter(
            ApiUsageEvent.user_id == user_id
        ).count() == 0
    test_engine.dispose()