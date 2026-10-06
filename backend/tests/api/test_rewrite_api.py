from fastapi.testclient import TestClient
from app.main import app
from app.auth.dependencies import get_current_user
from app.api import rewrite as rewrite_api
from types import SimpleNamespace

client = TestClient(app)

def test_rewrite_endpoint_requires_auth():

    response = client.post(
        "/api/rewrite-from-text",
        json={
            "resume_text": "Python Developer"
        }
    )

    assert response.status_code == 401


def test_rewrite_rejects_oversized_resume(monkeypatch):
    monkeypatch.setitem(
        app.dependency_overrides,
        get_current_user,
        lambda: SimpleNamespace(id=1),
    )
    monkeypatch.setattr(rewrite_api, "consume_usage", lambda *args, **kwargs: None)

    response = client.post(
        "/api/rewrite-from-text",
        json={"resume_text": "x" * 30001},
    )

    assert response.status_code == 422


def test_rewrite_receives_uploaded_job_description_and_guidance(monkeypatch):
    monkeypatch.setitem(
        app.dependency_overrides,
        get_current_user,
        lambda: SimpleNamespace(id=1),
    )
    monkeypatch.setattr(rewrite_api, "consume_usage", lambda *args, **kwargs: None)
    received = {}

    def capture_rewrite(*args, **kwargs):
        received.update(kwargs)
        return "Updated resume"

    monkeypatch.setattr(rewrite_api, "rewrite_resume", capture_rewrite)

    response = client.post(
        "/api/rewrite-from-text",
        json={
            "resume_text": "Python developer",
            "job_description": "Senior Cloud Engineer role",
            "improvement_instructions": "Emphasize AWS migration work",
        },
    )

    assert response.status_code == 200
    assert response.json() == {"rewrite": "Updated resume"}
    assert received["job_description"] == "Senior Cloud Engineer role"
    assert received["improvement_instructions"] == "Emphasize AWS migration work"