from app.services.gemini_analyzer import ask_gemini


def rewrite_resume(
    resume_text: str,
    skills: list,
    sections: dict,
    experience_level: str,
    ats_advice: dict
):

    prompt = f"""
        You are a Senior Technical Recruiter, ATS Consultant, Resume Writer, and Hiring Manager.

        GOAL:
        Rewrite the resume into a professional ATS-optimized resume suitable for DevOps, Cloud Engineering, Platform Engineering, Site Reliability Engineering, Backend Engineering, and Software Engineering positions.

        STRICT RULES:

        - Return ONLY the final resume.
        - No explanations.
        - No recommendations.
        - No analysis.
        - No markdown.
        - No code fences.
        - No bullet symbols other than standard resume bullets.
        - No placeholders.

        PRESERVE:

        - Candidate name
        - Contact information
        - Dates
        - Company names
        - Project names
        - Education
        - Certifications
        - Languages

        IMPROVE:

        - Grammar
        - Formatting
        - ATS readability
        - Professional wording
        - Keyword density
        - Achievement statements
        - Technical descriptions

        REMOVE:

        - OCR artifacts
        - Broken symbols
        - Duplicate content
        - Repeated sections
        - Translation duplicates
        - Unnecessary whitespace

        Candidate Experience Level:
        {experience_level}

        Detected Skills:
        {", ".join(skills)}

        Detected Sections:
        {sections}

        ATS Improvement Suggestions:
        {ats_advice.get("recommendations", [])}

        Missing ATS Keywords:
        {ats_advice.get("missing_keywords", [])}

        RAW RESUME:

        {resume_text}

        FINAL OUTPUT STRUCTURE:

        FULL NAME

        CONTACT INFORMATION

        PROFESSIONAL SUMMARY

        TECHNICAL SKILLS

        PROFESSIONAL EXPERIENCE

        PROJECTS

        EDUCATION

        CERTIFICATIONS

        LANGUAGES
        """

    return ask_gemini(prompt)