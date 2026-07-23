from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

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
        }
    )

    assert response.status_code == 200
    assert "error" in response.json()