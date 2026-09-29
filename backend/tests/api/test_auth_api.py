from fastapi.testclient import TestClient
from app.main import app
from app.database.db import engine
from app.database.models import Base, User
from sqlalchemy.orm import Session

client = TestClient(app)


def setup_function():
    Base.metadata.create_all(bind=engine)
    db = Session(bind=engine)
    db.query(User).delete()
    db.commit()
    db.close()


def test_login_invalid():

    response = client.post(
        "/api/auth/login",
        json={
            "email": "fake@test.com",
            "password": "wrong"
        }
    )

    assert response.status_code == 400


def test_register_and_login():
    response = client.post(
        "/api/auth/register",
        json={
            "email": "user@test.com",
            "password": "securepass"
        }
    )

    assert response.status_code == 200
    assert "access_token" in response.json()

    login_response = client.post(
        "/api/auth/login",
        json={
            "email": "user@test.com",
            "password": "securepass"
        }
    )

    assert login_response.status_code == 200
    assert "access_token" in login_response.json()
