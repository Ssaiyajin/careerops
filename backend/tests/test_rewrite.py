from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_rewrite_endpoint():

    response = client.post(
        "/api/rewrite-from-text",
        json={
            "resume_text": "Python Developer"
        }
    )

    assert response.status_code == 200
    assert "rewrite" in response.json()