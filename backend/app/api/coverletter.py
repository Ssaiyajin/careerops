from fastapi import APIRouter
from pydantic import BaseModel

from app.services.cover_letter_generator import generate_cover_letter

router = APIRouter()


class CoverLetterRequest(BaseModel):
    resume_text: str
    job_description: str


@router.post("/cover-letter-from-text")
async def cover_letter_from_text(
    request: CoverLetterRequest
):
    cover = generate_cover_letter(
        request.resume_text,
        request.job_description
    )

    return {
        "cover_letter": cover
    }
