import uuid

from fastapi import APIRouter, BackgroundTasks
from fastapi.responses import FileResponse

from pathlib import Path

from pydantic import BaseModel

from app.core.config import settings
from app.services.docx_generator import generate_docx

router = APIRouter()

EXPORT_DIR = Path(settings.export_dir)
EXPORT_DIR.mkdir(exist_ok=True)


class ResumeExportRequest(BaseModel):
    candidate_name: str
    email: str
    location: str
    skills: list[str]
    resume_text: str


class CoverLetterExportRequest(BaseModel):
    candidate_name: str
    email: str
    location: str
    skills: list[str]
    cover_letter_text: str


def _cleanup(path: Path):
    try:
        path.unlink(missing_ok=True)
    except Exception:
        pass


@router.post("/export-resume")
async def export_resume(
    request: ResumeExportRequest,
    background_tasks: BackgroundTasks,
):
    # A shared, fixed filename here would let concurrent requests
    # from different users overwrite (and potentially serve) each
    # other's exported resume. Each request gets its own file, which
    # is deleted once the response has been sent.
    output_file = EXPORT_DIR / f"{uuid.uuid4().hex}.docx"

    generate_docx(
        request.resume_text,
        str(output_file),
        single_page=True
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
):
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
