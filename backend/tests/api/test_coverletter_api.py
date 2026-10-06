from fastapi.testclient import TestClient
from types import SimpleNamespace

from app.api import coverletter as coverletter_api
from app.auth.dependencies import get_current_user
from app.main import app

client = TestClient(app)


def test_cover_letter_uses_job_description_and_returns_plain_text(
    monkeypatch,
):
    monkeypatch.setitem(
        app.dependency_overrides,
        get_current_user,
        lambda: SimpleNamespace(id=42),
    )
    monkeypatch.setattr(
        coverletter_api, "consume_usage", lambda *args, **kwargs: None
    )
    monkeypatch.setattr(
        coverletter_api,
        "generate_cover_letter",
        lambda resume, job: f"Tailored to: {job}",
    )

    response = client.post(
        "/api/cover-letter-from-text",
        json={
            "resume_text": "Python developer with cloud experience",
            "job_description": "Senior Cloud Engineer role",
        },
    )

    assert response.status_code == 200
    assert response.json() == {
        "cover_letter": "Tailored to: Senior Cloud Engineer role"
    }


def test_cover_letter_requires_job_description(monkeypatch):
    monkeypatch.setitem(
        app.dependency_overrides,
        get_current_user,
        lambda: SimpleNamespace(id=42),
    )

    response = client.post(
        "/api/cover-letter-from-text",
        json={"resume_text": "Python developer", "job_description": ""},
    )

    assert response.status_code == 422
