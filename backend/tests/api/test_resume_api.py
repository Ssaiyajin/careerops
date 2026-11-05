import asyncio
import io
import logging

import fitz
import pytest
from fastapi import HTTPException
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import Session
from sqlalchemy.pool import StaticPool
from starlette.datastructures import Headers

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

    assert response.status_code == 415
    assert response.json()["detail"] == "Only PDF files are allowed."


def test_upload_streams_and_stops_at_the_configured_file_size_limit(
    monkeypatch, tmp_path
):
    monkeypatch.setattr(resume_api, "MAX_UPLOAD_BYTES", 100)
    monkeypatch.setattr(resume_api, "UPLOAD_DIR", tmp_path)
    upload = resume_api.UploadFile(
        file=io.BytesIO(b"x" * 101),
        filename="large.pdf",
        size=None,
        headers=Headers({"content-type": "application/pdf"}),
    )
    read_sizes = []
    original_read = upload.read

    async def tracked_read(size=-1):
        read_sizes.append(size)
        return await original_read(size)

    monkeypatch.setattr(upload, "read", tracked_read)
    with pytest.raises(HTTPException) as error:
        asyncio.run(
            resume_api.upload_resume(
                file=upload,
                job_description="Python role",
                cv_language="en",
                current_user=object(),
            )
        )

    assert error.value.status_code == 413
    assert read_sizes == [resume_api.UPLOAD_CHUNK_BYTES]
    assert list(tmp_path.iterdir()) == []


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


def test_upload_selects_german_extractors_and_preserves_output_language(
    monkeypatch, auth_headers
):
    seen = {}

    def capture_language(name, value):
        def capture(_text, language):
            seen[name] = language
            return value

        return capture

    monkeypatch.setattr(
        resume_api, "extract_text_from_pdf", lambda _: "Maja Mustermann\nCloud Engineer"
    )
    monkeypatch.setattr(
        resume_api, "extract_name", capture_language("name_language", "Maja")
    )
    monkeypatch.setattr(
        resume_api, "process_text", capture_language("token_language", ["Cloud"])
    )
    monkeypatch.setattr(
        resume_api,
        "extract_entities",
        capture_language(
            "entity_language",
            {
                "emails": [],
                "phones": [],
                "names": [],
                "organizations": [],
                "locations": [],
                "dates": [],
            },
        ),
    )
    monkeypatch.setattr(resume_api, "extract_skills", lambda _: [])
    monkeypatch.setattr(
        resume_api, "calculate_ats_score", lambda *args: {"ats_score": 50}
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
        "match_resume_to_job",
        lambda *_args: {
            "match_score": 0,
            "missing_skills": [],
            "matched_skills": [],
        },
    )
    monkeypatch.setattr(
        resume_api,
        "semantic_job_match",
        lambda *_args: {"semantic_match_score": None},
    )
    rewrite_languages = []

    def capture_rewrite(*_args, **kwargs):
        rewrite_languages.append(kwargs["resume_language"])
        return "Lebenslauf"

    monkeypatch.setattr(resume_api, "rewrite_resume", capture_rewrite)
    recommendation_languages = []

    def capture_recommendations(_text, language):
        recommendation_languages.append(language)
        return "Empfehlungen"

    monkeypatch.setattr(
        resume_api,
        "generate_gemini_recommendations",
        capture_recommendations,
    )
    monkeypatch.setattr(resume_api, "save_resume_analysis", lambda **_kwargs: None)

    pdf = fitz.open()
    pdf.new_page().insert_text((72, 72), "Lebenslauf")
    pdf_bytes = pdf.tobytes()
    pdf.close()
    response = client.post(
        "/api/resume/upload",
        files={"file": ("lebenslauf.pdf", pdf_bytes, "application/pdf")},
        data={"job_description": "Cloud Engineer", "cv_language": "de"},
        headers=auth_headers,
    )

    assert response.status_code == 200
    assert response.json()["cv_language"] == "de"
    assert seen == {
        "name_language": "de",
        "token_language": "de",
        "entity_language": "de",
    }
    assert rewrite_languages == ["German"]
    assert recommendation_languages == ["German"]


def test_valid_pdf_upload_persists_job_specific_match(monkeypatch, auth_headers):
    monkeypatch.setattr(
        resume_api, "extract_name", lambda *_args: "Candidate"
    )
    monkeypatch.setattr(resume_api, "process_text", lambda *_args: ["Python"])
    monkeypatch.setattr(
        resume_api,
        "extract_entities",
        lambda *_args: {"emails": [], "phones": [], "names": [], "organizations": [], "locations": [], "dates": []},
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
    monkeypatch.setattr(
        resume_api, "rewrite_resume", lambda *args, **_kwargs: "Rewritten resume"
    )
    monkeypatch.setattr(
        resume_api,
        "generate_gemini_recommendations",
        lambda *args, **_kwargs: "Recommendations",
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
    assert response.json()["cv_language"] == "en"
    assert response.json()["ats_score_type"] == "heuristic"
    assert response.json()["job_description"] == (
        "Looking for Python, Kubernetes, and AWS."
    )
    assert response.json()["rewritten_resume"] == "Rewritten resume"
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


def test_upload_failure_logs_do_not_include_exception_message(
    monkeypatch, auth_headers, caplog
):
    def fail_save_resume_analysis(**_kwargs):
        raise RuntimeError("private resume content")

    monkeypatch.setattr(resume_api, "extract_name", lambda *_args: "Candidate")
    monkeypatch.setattr(resume_api, "process_text", lambda *_args: ["Python"])
    monkeypatch.setattr(
        resume_api,
        "extract_entities",
        lambda *_args: {"emails": [], "phones": [], "names": [], "organizations": [], "locations": [], "dates": []},
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
    monkeypatch.setattr(
        resume_api, "rewrite_resume", lambda *args, **_kwargs: "Rewritten resume"
    )
    monkeypatch.setattr(
        resume_api,
        "generate_gemini_recommendations",
        lambda *args, **_kwargs: "Recommendations",
    )
    monkeypatch.setattr(
        resume_api,
        "save_resume_analysis",
        fail_save_resume_analysis,
    )
    pdf = fitz.open()
    pdf.new_page().insert_text((72, 72), "Resume")
    pdf_bytes = pdf.tobytes()
    pdf.close()

    with caplog.at_level(logging.ERROR, logger=resume_api.__name__):
        response = client.post(
            "/api/resume/upload",
            files={"file": ("resume.pdf", pdf_bytes, "application/pdf")},
            data={"job_description": "Python role"},
            headers=auth_headers,
        )

    assert response.status_code == 500
    assert "saving resume analysis (RuntimeError)" in caplog.text
    assert "private resume content" not in caplog.text
