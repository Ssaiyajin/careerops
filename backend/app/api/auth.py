import os

from fastapi import APIRouter, Depends, HTTPException, Response, status
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.auth.auth import hash_password, verify_password
from app.auth.database import (
    create_password_reset_token,
    create_user,
    delete_user_account,
    get_user_by_email,
    get_user_by_id,
    get_valid_password_reset_token,
)
from app.auth.dependencies import get_current_user
from app.auth.jwt import create_access_token
from app.database.db import engine
from app.database.models import PasswordResetToken, User
from app.services.email_service import send_password_reset_email

router = APIRouter()


class UserRegister(BaseModel):
    email: str
    password: str


class UserLogin(BaseModel):
    email: str
    password: str


class ForgotPasswordRequest(BaseModel):
    email: str


class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str


@router.post("/register")
def register(user: UserRegister):
    normalized_email = user.email.strip().lower()
    if get_user_by_email(normalized_email):
        raise HTTPException(status_code=400, detail="User already exists")

    create_user(normalized_email, hash_password(user.password))

    token = create_access_token({"sub": normalized_email})

    return {"access_token": token}


@router.post("/login")
def login(user: UserLogin):
    normalized_email = user.email.strip().lower()
    db_user = get_user_by_email(normalized_email)

    if not db_user:
        raise HTTPException(status_code=400, detail="User not found")

    if not verify_password(user.password, db_user.hashed_password):
        raise HTTPException(status_code=400, detail="Invalid password")

    token = create_access_token({"sub": normalized_email})

    return {"access_token": token}


@router.post("/forgot-password")
def forgot_password(payload: ForgotPasswordRequest):
    normalized_email = payload.email.strip().lower()
    user = get_user_by_email(normalized_email)
    if user is None:
        return {"message": "If an account exists, a reset link has been sent."}

    reset_token = create_password_reset_token(user.id)
    base_url = os.getenv("APP_BASE_URL", "http://localhost:3000")
    reset_link = f"{base_url}/reset-password?token={reset_token}"
    email_sent = send_password_reset_email(normalized_email, reset_link)

    if email_sent:
        return {
            "message": "A password reset link has been sent to your email.",
            "reset_token": reset_token,
            "reset_link": reset_link,
        }

    return {
        "message": "SMTP is not configured; the reset token is shown for local/dev use.",
        "reset_token": reset_token,
        "reset_link": reset_link,
    }


@router.post("/reset-password")
def reset_password(payload: ResetPasswordRequest):
    if len(payload.new_password) < 8:
        raise HTTPException(
            status_code=400,
            detail="Password must be at least 8 characters long",
        )

    reset_record = get_valid_password_reset_token(payload.token)
    if reset_record is None:
        raise HTTPException(
            status_code=400,
            detail="Invalid or expired reset token",
        )

    user = get_user_by_id(reset_record.user_id)
    if user is None:
        raise HTTPException(
            status_code=400,
            detail="User not found for this reset request",
        )

    session = Session(bind=engine)
    try:
        db_user = session.query(User).filter(User.id == user.id).first()
        if db_user is None:
            raise HTTPException(status_code=400, detail="User not found")

        db_user.hashed_password = hash_password(payload.new_password)
        session.query(PasswordResetToken).filter(
            PasswordResetToken.id == reset_record.id
        ).delete(synchronize_session=False)
        session.commit()
    finally:
        session.close()

    return {"message": "Password reset successfully"}


@router.get("/session")
def check_session(current_user: User = Depends(get_current_user)):
    return {"authenticated": True}


@router.delete("/account", status_code=status.HTTP_204_NO_CONTENT)
def delete_account(current_user: User = Depends(get_current_user)):
    delete_user_account(current_user.id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
