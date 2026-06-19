from app.services.gemini_analyzer import ask_gemini

def generate_cover_letter(
    resume_text,
    job_description
):

    prompt = f"""
    You are a professional hiring manager.

    Write a personalized cover letter.

    Requirements:
    - Use the candidate's experience from the resume.
    - Match the provided job description.
    - Sound confident and professional.
    - Avoid generic AI phrases.
    - Keep between 250-400 words.
    - Mention relevant projects.
    - Mention relevant technical skills.
    - Include enthusiasm for the role.

    Resume:
    {resume_text}

    Job Description:
    {job_description}
"""

    return ask_gemini(prompt)