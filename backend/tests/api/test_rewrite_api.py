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