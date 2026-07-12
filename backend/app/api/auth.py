from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.auth.auth import hash_password, verify_password
from app.auth.jwt import create_access_token
from app.auth.database import fake_users_db

router = APIRouter()


class UserRegister(BaseModel):
    email: str
    password: str


class UserLogin(BaseModel):
    email: str
    password: str


@router.post("/register")
def register(user: UserRegister):
    if user.email in fake_users_db:
        raise HTTPException(status_code=400, detail="User already exists")

    fake_users_db[user.email] = {
        "email": user.email,
        "password": hash_password(user.password)
    }

    token = create_access_token({"sub": user.email})

    return {"access_token": token}


@router.post("/login")
def login(user: UserLogin):
    db_user = fake_users_db.get(user.email)

    if not db_user:
        raise HTTPException(status_code=400, detail="User not found")

    if not verify_password(user.password, db_user["password"]):
        raise HTTPException(status_code=400, detail="Invalid password")

    token = create_access_token({"sub": user.email})

    return {"access_token": token}