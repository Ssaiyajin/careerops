import logging
import uuid
from pathlib import Path

from fastapi import APIRouter, UploadFile, File, Form, Depends, HTTPException
from sqlalchemy.exc import SQLAlchemyError

from app.core.config import settings
from app.services.nlp_processor import process_text
from app.services.entity_extractor import extract_entities
from app.services.ats_scorer import calculate_ats_score
from app.services.experience_classifier import classify_experience
from app.services.section_parser import parse_resume_sections
from app.services.job_matcher import match_resume_to_job
from app.services.semantic_matcher import semantic_job_match
from app.services.name_extractor import extract_name
from app.services.pdf_parser import extract_text_from_pdf
from app.services.skill_extractor import extract_skills
from app.services.gemini_analyzer import generate_gemini_recommendations
from app.database.database_service import save_resume_analysis
from app.services.ats_advisor import generate_ats_advice
from app.services.resume_rewriter import rewrite_resume
from app.auth.dependencies import get_current_user
from app.database.models import User


router = APIRouter()
logger = logging.getLogger(__name__)

UPLOAD_DIR = Path(settings.upload_dir)
UPLOAD_DIR.mkdir(exist_ok=True)

MAX_UPLOAD_BYTES = settings.max_upload_size_mb * 1024 * 1024
MAX_RESUME_TEXT_CHARS = 30000
MAX_JOB_DESCRIPTION_CHARS = 20000


@router.post("/upload")
async def upload_resume(
    file: UploadFile = File(...),
    job_description: str = Form(..., min_length=1, max_length=MAX_JOB_DESCRIPTION_CHARS),
    current_user: User = Depends(get_current_user),
):
    file_path = None
    stage = "validating upload"
    try:
        # Validate PDF
        if file.content_type != "application/pdf":
            return {
                "error": "Only PDF files are allowed"
            }

        # Use a generated filename rather than the client-supplied one.
        # Trusting file.filename directly (e.g. writing to
        # UPLOAD_DIR / file.filename) allows path traversal
        # ("../../whatever") and lets concurrent uploads with the same
        # name overwrite each other.
        safe_filename = f"{uuid.uuid4().hex}.pdf"
        file_path = UPLOAD_DIR / safe_filename

        # Enforce a size limit before writing to disk.
        contents = await file.read()
        if len(contents) > MAX_UPLOAD_BYTES:
            return {
                "error": f"File too large — max {settings.max_upload_size_mb}MB"
            }

        with open(file_path, "wb") as buffer:
            buffer.write(contents)

        # Extract PDF text
        stage = "extracting resume text"
        extracted_text = extract_text_from_pdf(str(file_path))
        if len(extracted_text) > MAX_RESUME_TEXT_CHARS:
            raise HTTPException(
                status_code=413,
                detail=f"Extracted resume text exceeds {MAX_RESUME_TEXT_CHARS} characters.",
            )
        candidate_name = extract_name(extracted_text)
        stage = "analyzing resume content"
        tokens = process_text(extracted_text)

        # Extract skills
        skills = extract_skills(extracted_text)

        # Extract entities
        entities = extract_entities(extracted_text)

        ats_data = calculate_ats_score(
        skills,
        entities,
        extracted_text
        )

        ats_advice = generate_ats_advice(
        skills,
        ats_data,
        extracted_text
    )
        
        experience_level = classify_experience(
        extracted_text
        )
        

        sections = parse_resume_sections(
        extracted_text
        )
        
        job_description_skills = extract_skills(job_description)
        stage = "matching resume to job description"
        job_match_data = match_resume_to_job(
            skills,
            job_description_skills,
        )
        
        semantic_match_data = semantic_job_match(
        extracted_text,
        job_description
        )

        stage = "generating resume rewrite"
        rewritten_resume = rewrite_resume(
        extracted_text,
        skills,
        sections,
        experience_level,
        ats_advice
    )
        stage = "generating AI recommendations"
        try:

             ai_recommendations = (
            generate_gemini_recommendations(
                extracted_text
                    )
            )

        except Exception as e:

            print("GEMINI ERROR:", e)

            ai_recommendations = (
                "AI analysis currently unavailable."
            )
        # Save analysis to database, scoped to the logged-in user
        stage = "saving resume analysis"
        save_resume_analysis(
            candidate_name=candidate_name,
            email=entities.get("emails", [""])[0]
            if entities.get("emails")
            else "",
            ats_score=ats_data["ats_score"],
            match_score=job_match_data["match_score"],
            experience_level=experience_level,
            resume_text=extracted_text,
            user_id=current_user.id,
            )

        return {
        "message": "Resume processed successfully",
        "candidate_name": candidate_name,
        "filename": file.filename,
        "skills": skills,
        "missing_skills":job_match_data["missing_skills"],
        "entities": entities,
        "token_preview": tokens[:50],
        "text_preview": extracted_text[:1000],
        "ats": ats_data,
        "experience_level": experience_level,
        "sections": sections,
        "job_match": job_match_data,
        "semantic_match": semantic_match_data,
        "ai_recommendations": ai_recommendations,
        "ats_advice": ats_advice,
        "rewritten_resume": rewritten_resume,
        "job_description": job_description,
        }
    
    except HTTPException:
        raise
    except Exception as error:
        if isinstance(error, SQLAlchemyError):
            original_error = getattr(error, "orig", None)
            sqlstate = (
                getattr(original_error, "pgcode", None)
                or getattr(original_error, "sqlstate", None)
            )
            logger.error(
                "Resume upload failed during %s (database error%s)",
                stage,
                f", SQLSTATE {sqlstate}" if sqlstate else "",
            )
        else:
            logger.error(
                "Resume upload failed during %s (%s)",
                stage,
                type(error).__name__,
            )
        raise HTTPException(
            status_code=500,
            detail="Failed to process resume. Please try again.",
        )
    finally:
        # Clean up the uploaded file — nothing downstream needs it on
        # disk after extraction, and it's PII (a resume).
        try:
            if file_path is not None and file_path.exists():
                file_path.unlink()
        except Exception:
            pass
