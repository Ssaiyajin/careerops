import shutil

from fastapi import APIRouter, UploadFile, File, Form
from pathlib import Path
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
from app.services.llm_analyzer import generate_ai_recommendations

router = APIRouter()

UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)

job_description = """
We are looking for a DevOps Engineer
with experience in Docker, Kubernetes,
Terraform, AWS, CI/CD, and Python.
"""
target_job_skills = [
    "Python",
    "Docker",
    "Kubernetes",
    "Terraform",
    "AWS",
    "CI/CD",
    "FastAPI",
]


@router.post("/upload")
async def upload_resume(
    file: UploadFile = File(...),
    model: str = Form(...)
):

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
    candidate_name = extract_name(extracted_text)
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
    
    experience_level = classify_experience(
    extracted_text
    )
    

    sections = parse_resume_sections(
    extracted_text
    )
    
    job_match_data = match_resume_to_job(
    skills,
    target_job_skills
    )
    
    semantic_match_data = semantic_job_match(
    extracted_text,
    job_description
    )

    ai_recommendations = generate_ai_recommendations(
    extracted_text,
    model
    )

    return {
    "message": "Resume processed successfully",
    "candidate_name": candidate_name,
    "filename": file.filename,
    "skills": skills,
    "entities": entities,
    "token_preview": tokens[:50],
    "text_preview": extracted_text[:1000],
    "ats": ats_data,
    "experience_level": experience_level,
    "sections": sections,
    "job_match": job_match_data,
    "semantic_match": semantic_match_data,
    "ai_recommendations": ai_recommendations
    }