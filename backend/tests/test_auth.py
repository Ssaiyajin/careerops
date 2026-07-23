from fastapi.testclient import TestClient
from app.main import app
from app.auth.database import fake_users_db

client = TestClient(app)


def setup_function():
    fake_users_db.clear()


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