from app.services.gemini_analyzer import ask_gemini

def generate_cover_letter(
    resume_text,
    job_description
):

    prompt = f"""
    You are a professional hiring manager.
    IMPORTANT:

        This cover letter will be submitted digitally.

        Do NOT include:

        - Company address
        - Company postal information
        - Candidate postal address
        - Date header

        Start directly with:

        Dear Hiring Manager,

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
    IMPORTANT:

    Write in FIRST PERSON.

    Use:
    - I
    - My
    - Me

    Never use:
    - The candidate
    - Mr. Sawant
    - Nihar Sawant's resume
    - This applicant

    This is a cover letter written by the candidate.
    Resume:
    {resume_text}

    Job Description:
    {job_description}
"""

    return ask_gemini(prompt)