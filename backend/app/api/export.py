import uuid
from typing import Annotated

from fastapi import APIRouter, BackgroundTasks, Depends
from fastapi.responses import FileResponse

from pathlib import Path

from pydantic import BaseModel, ConfigDict, Field

from app.auth.dependencies import get_current_user
from app.core.config import settings
from app.database.models import User
from app.services.docx_generator import generate_docx
from app.services.usage_limits import consume_usage

router = APIRouter()

EXPORT_DIR = Path(settings.export_dir)
EXPORT_DIR.mkdir(exist_ok=True)


class ResumeExportRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    candidate_name: str = Field(max_length=200)
    email: str = Field(max_length=320)
    location: str = Field(max_length=200)
    skills: list[Annotated[str, Field(max_length=100)]] = Field(max_length=100)
    resume_text: str = Field(min_length=1, max_length=30000)


class CoverLetterExportRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    candidate_name: str = Field(max_length=200)
    email: str = Field(max_length=320)
    location: str = Field(max_length=200)
    skills: list[Annotated[str, Field(max_length=100)]] = Field(max_length=100)
    cover_letter_text: str = Field(min_length=1, max_length=15000)


def _cleanup(path: Path):
    try:
        path.unlink(missing_ok=True)
    except Exception:
        pass


@router.post("/export-resume")
async def export_resume(
    request: ResumeExportRequest,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user),
):
    consume_usage(current_user.id, "export")
    # A shared, fixed filename here would let concurrent requests
    # from different users overwrite (and potentially serve) each
    # other's exported resume. Each request gets its own file, which
    # is deleted once the response has been sent.
    output_file = EXPORT_DIR / f"{uuid.uuid4().hex}.docx"

    generate_docx(
        request.resume_text,
        str(output_file),
        resume=True,
    )

    background_tasks.add_task(_cleanup, output_file)

    return FileResponse(
        path=str(output_file),
        filename="CareerOps_Resume.docx",
        media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    )


@router.post("/export-cover-letter")
async def export_cover_letter(
    request: CoverLetterExportRequest,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user),
):
    consume_usage(current_user.id, "export")
    output_file = EXPORT_DIR / f"{uuid.uuid4().hex}.docx"

    generate_docx(
        request.cover_letter_text,
        str(output_file)
    )

    background_tasks.add_task(_cleanup, output_file)

    return FileResponse(
        path=str(output_file),
        filename="CareerOps_Cover_Letter.docx",
        media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    )
