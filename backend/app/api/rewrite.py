from fastapi import APIRouter, UploadFile, File

from app.services.pdf_parser import extract_text_from_pdf
from app.services.resume_rewriter import rewrite_resume

import shutil
from pathlib import Path

router = APIRouter()

UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)


@router.post("/rewrite")
async def rewrite_resume_endpoint(
    file: UploadFile = File(...)
):

    file_path = UPLOAD_DIR / file.filename

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(
            file.file,
            buffer
        )

    resume_text = extract_text_from_pdf(
        str(file_path)
    )

    try:

        rewritten_content = rewrite_resume(
            resume_text
        )

    except Exception as e:

        print("REWRITE ERROR:", e)

        rewritten_content = (
            "Resume rewrite temporarily unavailable."
        )

    return {
        "rewrite": rewritten_content
    }