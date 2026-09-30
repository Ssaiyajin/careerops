from fastapi import APIRouter, Depends
from pydantic import BaseModel, ConfigDict, Field

from app.auth.dependencies import get_current_user
from app.database.models import User
from app.services.resume_rewriter import rewrite_resume
from app.services.usage_limits import consume_usage

router = APIRouter()


class RewriteRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    resume_text: str = Field(min_length=1, max_length=30000)


@router.post("/rewrite-from-text")
async def rewrite_resume_endpoint(
    request: RewriteRequest,
    current_user: User = Depends(get_current_user),
):
    consume_usage(current_user.id, "generation")
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