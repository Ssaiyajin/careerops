from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from app.services.cover_letter_generator import generate_cover_letter
from app.services.pdf_parser import extract_text_from_pdf

import shutil
from pathlib import Path
from typing import Optional


UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)


router = APIRouter()
from pydantic import BaseModel

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
