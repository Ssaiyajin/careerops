from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def _auth_headers():
    register_response = client.post(
        "/api/auth/register",
        json={
            "email": "resume-test@test.com",
            "password": "securepass"
        }
    )
    token = register_response.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


def test_upload_requires_auth():
    response = client.post(
        "/api/resume/upload",
        files={"file": ("fake.txt", b"hello", "text/plain")},
        data={"job_description": "Python Developer"},
    )

    assert response.status_code == 401


def test_upload_no_pdf():
    response = client.post(
        "/api/resume/upload",
        files={
            "file": (
                "fake.txt",
                b"hello",
                "text/plain"
            )
        },
        data={
            "job_description": "Python Developer"
        },
        headers=_auth_headers(),
    )

    assert response.status_code == 200
    assert "error" in response.json()
