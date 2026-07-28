from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.auth.auth import hash_password, verify_password
from app.auth.jwt import create_access_token
from app.auth.database import get_user_by_email, create_user

router = APIRouter()


class UserRegister(BaseModel):
    email: str
    password: str


class UserLogin(BaseModel):
    email: str
    password: str


@router.post("/register")
def register(user: UserRegister):
    if get_user_by_email(user.email):
        raise HTTPException(status_code=400, detail="User already exists")

    create_user(user.email, hash_password(user.password))

    token = create_access_token({"sub": user.email})

    return {"access_token": token}


@router.post("/login")
def login(user: UserLogin):
    db_user = get_user_by_email(user.email)

    if not db_user:
        raise HTTPException(status_code=400, detail="User not found")

    if not verify_password(user.password, db_user.hashed_password):
        raise HTTPException(status_code=400, detail="Invalid password")

    token = create_access_token({"sub": user.email})

    return {"access_token": token}
