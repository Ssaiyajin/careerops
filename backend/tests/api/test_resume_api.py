import fitz
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import Session
from sqlalchemy.pool import StaticPool

from app.api import history as history_api
from app.api import resume as resume_api
from app.auth import database as auth_database
from app.auth.jwt import create_access_token
from app.database import database_service
from app.database.models import Base, ResumeAnalysis, User
from app.main import app

client = TestClient(app)


@pytest.fixture
def auth_headers(monkeypatch):
    test_engine = create_engine(
        "sqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    Base.metadata.create_all(bind=test_engine)
    monkeypatch.setattr(auth_database, "engine", test_engine)
    monkeypatch.setattr(database_service, "engine", test_engine)
    monkeypatch.setattr(history_api, "engine", test_engine)

    email = "resume-integration@test.com"
    with Session(bind=test_engine) as db:
        db.add(User(email=email, hashed_password="unused"))
        db.commit()

    token = create_access_token({"sub": email})
    yield {"Authorization": f"Bearer {token}"}
    test_engine.dispose()


def test_upload_requires_auth():
    response = client.post(
        "/api/resume/upload",
        files={"file": ("fake.txt", b"hello", "text/plain")},
        data={"job_description": "Python Developer"},
    )

    assert response.status_code == 401


def test_upload_no_pdf(auth_headers):
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
        headers=auth_headers,
    )

    assert response.status_code == 200
    assert "error" in response.json()


def test_upload_rejects_oversized_job_description(auth_headers):
    response = client.post(
        "/api/resume/upload",
        files={"file": ("resume.pdf", b"unused", "application/pdf")},
        data={"job_description": "x" * (resume_api.MAX_JOB_DESCRIPTION_CHARS + 1)},
        headers=auth_headers,
    )

    assert response.status_code == 422


def test_upload_rejects_oversized_extracted_resume(monkeypatch, auth_headers):
    monkeypatch.setattr(
        resume_api,
        "extract_text_from_pdf",
        lambda _: "x" * (resume_api.MAX_RESUME_TEXT_CHARS + 1),
    )
    pdf = fitz.open()
    pdf.new_page().insert_text((72, 72), "Resume")
    pdf_bytes = pdf.tobytes()
    pdf.close()

    response = client.post(
        "/api/resume/upload",
        files={"file": ("resume.pdf", pdf_bytes, "application/pdf")},
        data={"job_description": "Python role"},
        headers=auth_headers,
    )

    assert response.status_code == 413


def test_valid_pdf_upload_persists_job_specific_match(monkeypatch, auth_headers):
    monkeypatch.setattr(
        resume_api, "extract_name", lambda _: "Candidate"
    )
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
    pdf = fitz.open()
    page = pdf.new_page()
    page.insert_text((72, 72), "Python and Docker developer")
    pdf_bytes = pdf.tobytes()
    pdf.close()

    response = client.post(
        "/api/resume/upload",
        files={"file": ("resume.pdf", pdf_bytes, "application/pdf")},
        data={"job_description": "Looking for Python, Kubernetes, and AWS."},
        headers=auth_headers,
    )

    assert response.status_code == 200
    job_match = response.json()["job_match"]
    assert job_match["match_score"] == 33
    assert set(job_match["matched_skills"]) == {"python"}
    assert set(job_match["missing_skills"]) == {"kubernetes", "aws"}

    history_response = client.get("/api/history", headers=auth_headers)
    assert history_response.status_code == 200
    assert len(history_response.json()) == 1
    assert history_response.json()[0]["match_score"] == 33

    with Session(bind=database_service.engine) as db:
        saved = db.query(ResumeAnalysis).one()
        assert saved.resume_text == "Python and Docker developer"
