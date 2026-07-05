from fastapi import APIRouter
from fastapi.responses import FileResponse

from pathlib import Path

from pydantic import BaseModel

from app.services.docx_generator import generate_docx

router = APIRouter()

print("EXPORT ROUTER LOADED")

class ResumeExportRequest(
    BaseModel
):

    candidate_name: str

    email: str

    location: str

    skills: list[str]

    resume_text: str

class CoverLetterExportRequest(
    BaseModel
):

    candidate_name: str

    email: str

    location: str

    skills: list[str]

    cover_letter_text: str


@router.post("/export-resume")

async def export_resume(
    request: ResumeExportRequest
):

    output_file = (
        Path("exports")
        / "careerops_resume.docx"
    )

    output_file.parent.mkdir(
        exist_ok=True
    )

    generate_docx(
        request.resume_text,
        str(output_file),
        single_page=True
    )

    return FileResponse(
            path=str(output_file),
            filename="CareerOps_Resume.docx",
            media_type=
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        )

@router.post("/export-cover-letter")

async def export_cover_letter(
    request: CoverLetterExportRequest
):
    output_file = (
        Path("exports")
        / "careerops_cover_letter.docx"
    )

    output_file.parent.mkdir(
        exist_ok=True
    )

    generate_docx(
        request.cover_letter_text,
        str(output_file)
    )

    return FileResponse(
        path=str(output_file),
        filename="CareerOps_Cover_Letter.docx",
        media_type=
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    )