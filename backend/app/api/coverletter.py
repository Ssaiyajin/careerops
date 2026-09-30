from fastapi import APIRouter, Depends
from pydantic import BaseModel, ConfigDict, Field

from app.auth.dependencies import get_current_user
from app.database.models import User
from app.services.cover_letter_generator import generate_cover_letter
from app.services.usage_limits import consume_usage

router = APIRouter()


class CoverLetterRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    resume_text: str = Field(min_length=1, max_length=30000)
    job_description: str = Field(min_length=1, max_length=20000)


@router.post("/cover-letter-from-text")
async def cover_letter_from_text(
    request: CoverLetterRequest,
    current_user: User = Depends(get_current_user),
):
    consume_usage(current_user.id, "generation", units=2)
    cover = generate_cover_letter(
        request.resume_text,
        request.job_description
    )

    return {
        "cover_letter": cover
    }
