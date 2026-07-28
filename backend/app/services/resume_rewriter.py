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
        
        IMPORTANT LENGTH RULES:

        - HARD LIMIT: 450 words maximum.
        - HARD LIMIT: 1 page maximum.
        - Maximum 3 bullets per job.
        - Maximum 2 bullets per project.
        - Professional Summary maximum 3 lines.
        - Keep only the strongest projects.
        - Remove duplicate technologies.
        - Remove weak academic descriptions.
        - Remove filler words.
        - Prefer concise recruiter-style wording.
        If content exceeds one page,
        remove less important information until it fits.
        
        If content exceeds one page:

        - prioritize recent experience
        - prioritize DevOps projects
        - prioritize cloud projects
        - compress older experience
        - remove weak bullet points
        OUTPUT STYLE:

        - Modern ATS-friendly resume.
        - Compact spacing.
        - Recruiter-friendly formatting.
        - Designed to fit on a single page.

        RECRUITER RULES:

        - Target German and international tech companies.
        - Prioritize AWS, Terraform, Kubernetes, Docker, Python, CI/CD and Cloud Engineering experience.
        - Remove weak academic descriptions.
        - Focus on measurable achievements.
        - Keep resume between 450 and 600 words.
        - Use concise bullet points.
        - Avoid long paragraphs.
        - Prefer business impact over technical explanations.

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