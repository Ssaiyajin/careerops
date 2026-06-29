from fastapi import APIRouter
from fastapi.responses import FileResponse

from pathlib import Path

from pydantic import BaseModel

from app.services.docx_generator import (
    generate_resume_docx
)

router = APIRouter()



class ResumeExportRequest(
    BaseModel
):

    candidate_name: str

    email: str

    location: str

    skills: list[str]

    resume_text: str


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

    
    generate_resume_docx(
        request.candidate_name,
        request.email,
        request.location,
        request.skills,
        request.resume_text,
        str(output_file)
    )

    return FileResponse(
        path=str(output_file),
        filename="CareerOps_Resume.docx",
        media_type=
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    )