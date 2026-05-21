from fastapi import APIRouter, UploadFile, File
from pathlib import Path
from app.services.nlp_processor import process_text
import shutil

from app.services.pdf_parser import extract_text_from_pdf
from app.services.skill_extractor import extract_skills

router = APIRouter()

UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)


@router.post("/upload")
async def upload_resume(file: UploadFile = File(...)):

    # Validate PDF
    if file.content_type != "application/pdf":
        return {
            "error": "Only PDF files are allowed"
        }

    file_path = UPLOAD_DIR / file.filename

    # Save file
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # Extract PDF text
    extracted_text = extract_text_from_pdf(str(file_path))
    tokens = process_text(extracted_text)

    # Extract skills
    skills = extract_skills(extracted_text)

    return {
    "message": "Resume processed successfully",
    "filename": file.filename,
    "skills": skills,
    "token_preview": tokens[:50],
    "text_preview": extracted_text[:1000]
    }