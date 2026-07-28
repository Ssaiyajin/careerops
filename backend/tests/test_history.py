from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_history_requires_auth():
    """/history now returns each user's own data only, so an
    unauthenticated request should be rejected rather than returning
    everyone's resume history."""

    response = client.get("/api/history")

    assert response.status_code == 401 # no Authorization header at all


def test_history_with_valid_token():
    register_response = client.post(
        "/api/auth/register",
        json={
            "email": "history-test@test.com",
            "password": "securepass"
        }
    )
    token = register_response.json()["access_token"]

    response = client.get(
        "/api/history",
        headers={"Authorization": f"Bearer {token}"}
    )

    assert response.status_code == 200
    assert isinstance(response.json(), list)
