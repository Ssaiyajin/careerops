from fastapi import APIRouter
from pydantic import BaseModel

from app.services.resume_rewriter import rewrite_resume

router = APIRouter()


class RewriteRequest(BaseModel):
    resume_text: str


@router.post("/rewrite-from-text")
async def rewrite_resume_endpoint(
    request: RewriteRequest
):
    try:

        rewritten_content = rewrite_resume(
            request.resume_text,
            skills=[],
            sections={},
            experience_level="Mid-level",
            ats_advice={}
        )

    except Exception as e:

        print("REWRITE ERROR:", e)

        rewritten_content = (
            "Resume rewrite temporarily unavailable."
        )

    return {
        "rewrite": rewritten_content
    }