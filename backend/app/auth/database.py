from sqlalchemy.orm import Session

from app.database.db import engine
from app.database.models import User


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
