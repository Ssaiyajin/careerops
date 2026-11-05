from types import SimpleNamespace
from unittest.mock import Mock

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import Session
from sqlalchemy.pool import StaticPool

from app.api import career as career_api
from app.auth.dependencies import get_current_user
from app.database.models import Base, ResumeAnalysis, User
from app.main import app
from app.services.career_coach import CareerCoachUnavailable

client = TestClient(app)


def authorize(monkeypatch):
    monkeypatch.setitem(
        app.dependency_overrides,
        get_current_user,
        lambda: SimpleNamespace(id=1),
    )
    monkeypatch.setattr(career_api, "consume_usage", Mock())


def test_career_coach_endpoints_require_authentication():
    requests = [
        ("GET", "/api/career/context", None),
        ("POST", "/api/career/chat", {"message": "Help me plan my next move"}),
        ("POST", "/api/career/interview-prep", {"target_role": "Engineer"}),
        ("POST", "/api/career/learning-plan", {"goal": "Learn Python"}),
    ]

    for method, path, body in requests:
        response = client.request(method, path, json=body)
        assert response.status_code == 401


def test_chat_uses_recent_conversation_and_optional_career_context(monkeypatch):
    authorize(monkeypatch)
    received = {}

    def generate(prompt):
        received["prompt"] = prompt
        return "Start by tailoring your project examples to the role."

    monkeypatch.setattr(career_api, "generate_career_response", generate)
    response = client.post(
        "/api/career/chat",
        json={
            "message": "What should I improve?",
            "target_role": "Cloud Engineer",
            "history": [{"role": "user", "content": "I want a new role"}],
            "resume_text": "Python and AWS experience",
            "job_description": "Build reliable cloud platforms",
        },
    )

    assert response.status_code == 200
    assert response.json() == {
        "answer": "Start by tailoring your project examples to the role."
    }
    assert "Python and AWS experience" in received["prompt"]
    assert "Build reliable cloud platforms" in received["prompt"]
    assert "user: I want a new role" in received["prompt"]
    assert "user: What should I improve?" in received["prompt"]


@pytest.mark.parametrize(
    ("path", "body", "prompt_parts"),
    [
        (
            "/api/career/interview-prep",
            {
                "target_role": "Platform Engineer",
                "resume_text": "Built CI pipelines",
                "job_description": "Own Kubernetes platforms",
            },
            ["Platform Engineer", "Built CI pipelines", "STAR"],
        ),
        (
            "/api/career/learning-plan",
            {
                "goal": "Prepare for a data analyst role",
                "target_role": "Data Analyst",
                "current_skills": ["SQL", "Excel"],
                "duration_weeks": 12,
                "hours_per_week": 4,
            },
            ["Prepare for a data analyst role", "12 weeks", "4 hours per week", "SQL, Excel"],
        ),
    ],
)
def test_interview_and_learning_tools_generate_contextual_plans(
    monkeypatch, path, body, prompt_parts
):
    authorize(monkeypatch)
    received = {}

    def generate(prompt):
        received["prompt"] = prompt
        return "A practical, tailored plan."

    monkeypatch.setattr(career_api, "generate_career_response", generate)
    response = client.post(path, json=body)

    assert response.status_code == 200
    assert response.json() == {"answer": "A practical, tailored plan."}
    for part in prompt_parts:
        assert part in received["prompt"]


def test_career_requests_validate_context_and_plan_limits(monkeypatch):
    authorize(monkeypatch)
    oversized_resume = client.post(
        "/api/career/chat",
        json={"message": "Help", "resume_text": "x" * 30_001},
    )
    oversized_job = client.post(
        "/api/career/interview-prep",
        json={"target_role": "Engineer", "job_description": "x" * 12_001},
    )
    invalid_duration = client.post(
        "/api/career/learning-plan",
        json={"goal": "Learn Python", "duration_weeks": 53},
    )
    blank_role = client.post(
        "/api/career/interview-prep",
        json={"target_role": "  "},
    )

    assert oversized_resume.status_code == 422
    assert oversized_job.status_code == 422
    assert invalid_duration.status_code == 422
    assert blank_role.status_code == 422


def test_gemini_unavailability_is_reported_as_service_unavailable(monkeypatch):
    authorize(monkeypatch)

    def unavailable(prompt):
        assert prompt
        raise CareerCoachUnavailable("Career coaching is not configured.")

    monkeypatch.setattr(career_api, "generate_career_response", unavailable)
    response = client.post(
        "/api/career/chat",
        json={"message": "Help me choose a career path"},
    )

    assert response.status_code == 503
    assert response.json()["detail"] == "Career coaching is not configured."


def test_latest_resume_context_is_scoped_to_the_signed_in_user(monkeypatch):
    authorize(monkeypatch)
    test_engine = create_engine(
        "sqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    Base.metadata.create_all(test_engine)
    monkeypatch.setattr(career_api, "engine", test_engine)

    with Session(bind=test_engine) as db:
        db.add_all(
            [
                User(id=1, email="one@example.com", hashed_password="hash"),
                User(id=2, email="two@example.com", hashed_password="hash"),
                ResumeAnalysis(
                    user_id=1,
                    candidate_name="Candidate One",
                    resume_text="Older resume",
                ),
                ResumeAnalysis(
                    user_id=1,
                    candidate_name="Candidate One",
                    resume_text="Latest resume",
                ),
                ResumeAnalysis(
                    user_id=2,
                    candidate_name="Candidate Two",
                    resume_text="Another user's resume",
                ),
            ]
        )
        db.commit()

    response = client.get("/api/career/context")

    assert response.status_code == 200
    assert response.json() == {
        "available": True,
        "resume_text": "Latest resume",
    }
    test_engine.dispose()
