from app.services.gemini_analyzer import ask_gemini


def rewrite_resume(resume_text: str):

    prompt = f"""
   You are a senior technical recruiter and ATS resume expert.

        Task:
        Rewrite the resume below into a professional ATS-optimized resume.

        Rules:
        - Return ONLY the rewritten resume.
        - Do NOT provide analysis.
        - Do NOT provide strengths or weaknesses.
        - Do NOT provide recommendations.
        - Preserve all factual information.
        - Preserve all dates.
        - Preserve all company names.
        - Preserve all project names.
        - Preserve all certifications.
        - Preserve all education details.
        - Improve grammar and wording.
        - Use strong action verbs.
        - Improve ATS keyword density naturally.
        - Keep a clean professional structure.

        Required Structure:

        FULL NAME

        CONTACT INFORMATION

        PROFESSIONAL SUMMARY

        TECHNICAL SKILLS

        PROFESSIONAL EXPERIENCE

        PROJECTS

        EDUCATION

        CERTIFICATIONS

        LANGUAGES

        Resume:

        {resume_text}
"""

    return ask_gemini(prompt)