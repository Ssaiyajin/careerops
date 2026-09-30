from datetime import datetime, timezone

from fastapi import HTTPException, status
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.core.config import settings
from app.database.db import engine
from app.database.models import ApiUsageEvent, User


def consume_usage(user_id: int, operation: str, units: int = 1) -> None:
    now = datetime.now(timezone.utc).timestamp()
    is_generation = operation == "generation"
    per_minute_limit = (
        settings.generation_requests_per_minute
        if is_generation
        else settings.export_requests_per_minute
    )
    per_day_limit = (
        settings.generation_credits_per_day
        if is_generation
        else settings.exports_per_day
    )
    operation_label = "generation" if is_generation else "export"

    with Session(bind=engine) as db:
        # Serialize quota checks for one account so parallel requests cannot
        # all pass the same remaining allowance.
        user = (
            db.query(User)
            .filter(User.id == user_id)
            .with_for_update()
            .first()
        )
        if user is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User not found",
            )

        db.query(ApiUsageEvent).filter(
            ApiUsageEvent.user_id == user_id,
            ApiUsageEvent.created_at_epoch < now - 86400,
        ).delete(synchronize_session=False)

        minute_count = (
            db.query(func.count(ApiUsageEvent.id))
            .filter(
                ApiUsageEvent.user_id == user_id,
                ApiUsageEvent.operation == operation_label,
                ApiUsageEvent.created_at_epoch >= now - 60,
            )
            .scalar()
        )
        if minute_count >= per_minute_limit:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail=f"Too many {operation_label} requests. Try again in a minute.",
                headers={"Retry-After": "60"},
            )

        used_today = (
            db.query(func.coalesce(func.sum(ApiUsageEvent.units), 0))
            .filter(
                ApiUsageEvent.user_id == user_id,
                ApiUsageEvent.operation == operation_label,
            )
            .scalar()
        )
        if used_today + units > per_day_limit:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail=f"Daily {operation_label} limit reached.",
                headers={"Retry-After": "86400"},
            )

        db.add(
            ApiUsageEvent(
                user_id=user_id,
                operation=operation_label,
                units=units,
                created_at_epoch=now,
            )
        )
        db.commit()