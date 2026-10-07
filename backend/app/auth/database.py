import hashlib
import secrets
from datetime import datetime, timedelta, timezone

from sqlalchemy.orm import Session

from app.database.db import engine
from app.database.models import ApiUsageEvent, PasswordResetToken, ResumeAnalysis, User


def get_user_by_email(email: str):
    db = Session(bind=engine)
    try:
        return db.query(User).filter(User.email == email).first()
    finally:
        db.close()


def get_user_by_id(user_id: int):
    db = Session(bind=engine)
    try:
        return db.query(User).filter(User.id == user_id).first()
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


def create_password_reset_token(user_id: int, expires_minutes: int = 30):
    reset_token = secrets.token_urlsafe(32)
    token_hash = hashlib.sha256(reset_token.encode("utf-8")).hexdigest()
    expires_at = datetime.now(timezone.utc) + timedelta(minutes=expires_minutes)

    db = Session(bind=engine)
    try:
        db.query(PasswordResetToken).filter(
            PasswordResetToken.user_id == user_id
        ).delete(synchronize_session=False)

        record = PasswordResetToken(
            user_id=user_id,
            token_hash=token_hash,
            expires_at=expires_at,
        )
        db.add(record)
        db.commit()
        return reset_token
    finally:
        db.close()


def get_valid_password_reset_token(raw_token: str):
    if not raw_token:
        return None

    token_hash = hashlib.sha256(raw_token.encode("utf-8")).hexdigest()
    db = Session(bind=engine)
    try:
        now = datetime.now(timezone.utc)
        return db.query(PasswordResetToken).filter(
            PasswordResetToken.token_hash == token_hash,
            PasswordResetToken.used_at.is_(None),
            PasswordResetToken.expires_at > now,
        ).first()
    finally:
        db.close()


def consume_password_reset_token(raw_token: str) -> bool:
    reset_record = get_valid_password_reset_token(raw_token)
    if reset_record is None:
        return False

    db = Session(bind=engine)
    try:
        record = db.query(PasswordResetToken).filter(
            PasswordResetToken.id == reset_record.id
        ).first()
        if record is None:
            return False

        record.used_at = datetime.now(timezone.utc)
        db.commit()
        return True
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
        db.query(PasswordResetToken).filter(
            PasswordResetToken.user_id == user_id
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
