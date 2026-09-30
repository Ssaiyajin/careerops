from fastapi.testclient import TestClient

from app.main import app


client = TestClient(app)


def test_cover_letter_and_export_routes_require_auth():
    requests = [
        (
            "/api/cover-letter-from-text",
            {"resume_text": "resume", "job_description": "role"},
        ),
        (
            "/api/export-resume",
            {
                "candidate_name": "Candidate",
                "email": "candidate@example.com",
                "location": "Location",
                "skills": ["Python"],
                "resume_text": "resume",
            },
        ),
        (
            "/api/export-cover-letter",
            {
                "candidate_name": "Candidate",
                "email": "candidate@example.com",
                "location": "Location",
                "skills": ["Python"],
                "cover_letter_text": "letter",
            },
        ),
    ]

    for path, body in requests:
        response = client.post(path, json=body)
        assert response.status_code == 401


def test_account_deletion_requires_auth():
    response = client.delete("/api/auth/account")

    assert response.status_code == 401


def test_session_check_requires_auth():
    response = client.get("/api/auth/session")

    assert response.status_code == 401