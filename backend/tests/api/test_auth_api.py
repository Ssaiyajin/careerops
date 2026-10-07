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


def test_forgot_password_and_reset_password():
    register_response = client.post(
        "/api/auth/register",
        json={
            "email": "reset@test.com",
            "password": "oldpass123"
        }
    )

    assert register_response.status_code == 200

    forgot_response = client.post(
        "/api/auth/forgot-password",
        json={"email": "reset@test.com"}
    )

    assert forgot_response.status_code == 200
    payload = forgot_response.json()
    assert "reset_token" in payload

    reset_response = client.post(
        "/api/auth/reset-password",
        json={
            "token": payload["reset_token"],
            "new_password": "newpass456"
        }
    )

    assert reset_response.status_code == 200

    login_response = client.post(
        "/api/auth/login",
        json={
            "email": "reset@test.com",
            "password": "newpass456"
        }
    )

    assert login_response.status_code == 200
    assert "access_token" in login_response.json()


