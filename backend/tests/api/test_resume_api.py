from types import SimpleNamespace

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


def test_upload_matches_skills_from_job_description(monkeypatch):
    from app.api import resume as resume_api
    from app.database.db import engine
    from app.database.models import Base

    Base.metadata.create_all(bind=engine)

    register_response = client.post(
        "/api/auth/register",
        json={"email": "job-match-test@test.com", "password": "securepass"},
    )
    token = register_response.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    monkeypatch.setattr(
        resume_api, "extract_text_from_pdf", lambda _: "Python and Docker developer"
    )
    monkeypatch.setattr(resume_api, "extract_name", lambda _: "Candidate")
    monkeypatch.setattr(resume_api, "process_text", lambda _: ["Python"])
    monkeypatch.setattr(
        resume_api,
        "extract_entities",
        lambda _: {"emails": [], "phones": [], "names": [], "organizations": [], "locations": [], "dates": []},
    )
    monkeypatch.setattr(
        resume_api,
        "calculate_ats_score",
        lambda *args: {"ats_score": 80, "recommendations": []},
    )
    monkeypatch.setattr(
        resume_api,
        "generate_ats_advice",
        lambda *args: {"recommendations": [], "missing_keywords": []},
    )
    monkeypatch.setattr(resume_api, "classify_experience", lambda _: "Mid-level")
    monkeypatch.setattr(resume_api, "parse_resume_sections", lambda _: {})
    monkeypatch.setattr(
        resume_api,
        "semantic_job_match",
        lambda *args: {"semantic_match_score": None},
    )
    monkeypatch.setattr(resume_api, "rewrite_resume", lambda *args: "Rewritten resume")
    monkeypatch.setattr(
        resume_api, "generate_gemini_recommendations", lambda *args: "Recommendations"
    )
    monkeypatch.setattr(
        resume_api,
        "save_resume_analysis",
        lambda **kwargs: SimpleNamespace(id=1),
    )

    response = client.post(
        "/api/resume/upload",
        files={"file": ("resume.pdf", b"fake pdf", "application/pdf")},
        data={"job_description": "Looking for Python, Kubernetes, and AWS."},
        headers=headers,
    )

    assert response.status_code == 200
    job_match = response.json()["job_match"]
    assert job_match["match_score"] == 33
    assert set(job_match["matched_skills"]) == {"python"}
    assert set(job_match["missing_skills"]) == {"kubernetes", "aws"}
