import pytest
from fastapi import HTTPException
from sqlalchemy import create_engine
from sqlalchemy.orm import Session

from app.core.config import settings
from app.database.models import Base, User
from app.services import usage_limits


def test_generation_credit_limit_is_enforced(monkeypatch):
    test_engine = create_engine("sqlite://")
    Base.metadata.create_all(bind=test_engine)
    with Session(bind=test_engine) as db:
        user = User(email="quota-test@example.com", hashed_password="unused")
        db.add(user)
        db.commit()
        user_id = user.id

    monkeypatch.setattr(usage_limits, "engine", test_engine)
    monkeypatch.setattr(settings, "generation_requests_per_minute", 10)
    monkeypatch.setattr(settings, "generation_credits_per_day", 3)

    usage_limits.consume_usage(user_id, "generation", units=2)
    usage_limits.consume_usage(user_id, "generation", units=1)

    with pytest.raises(HTTPException) as error:
        usage_limits.consume_usage(user_id, "generation", units=1)

    assert error.value.status_code == 429
    test_engine.dispose()