from app.services.gemini_analyzer import (
    GEMINI_UNAVAILABLE_RESPONSE,
    ask_gemini,
)


def rewrite_resume(
    resume_text: str,
    skills: list,
    sections: dict,
    experience_level: str,
    ats_advice: dict,
    job_description: str = "",
    improvement_instructions: str = "",
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

        - Keep the resume concise, usually 1-2 pages depending on the source content.
        - Maximum 3 bullets per job.
        - Maximum 2 bullets per project.
        - Professional Summary maximum 3 concise sentences.
        - Keep only the strongest projects.
        - Remove duplicate technologies.
        - Remove weak academic descriptions.
        - Remove filler words.
        - Prefer concise recruiter-style wording.

        OUTPUT STYLE:

        - Modern, polished, ATS-friendly resume that keeps the uploaded resume's facts and recognizable section order.
        - Use a clear hierarchy: candidate name, one contact-details line, uppercase section headings, then concise content.
        - Put each job or project title, organization, and dates together on one line when the source provides them.
        - Put achievements on separate lines beginning with "• ".
        - Keep skills concise and grouped on readable lines.
        - Use plain text only; do not use markdown, tables, columns, decorative symbols, or code fences.

        RECRUITER RULES:

        - Target German and international tech companies.
        - Prioritize AWS, Terraform, Kubernetes, Docker, Python, CI/CD and Cloud Engineering experience.
        - Remove weak academic descriptions.
        - Focus on measurable achievements.
        - Preserve relevant source content; do not impose a word count that removes important experience.
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

        FACTUAL ACCURACY:

        - Never invent employers, titles, dates, qualifications, skills, metrics, or achievements.
        - Preserve the candidate's actual contact information and the original meaning of their experience.
        - If source content is unclear, omit the uncertain detail rather than guessing.

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

        TARGET JOB DESCRIPTION:
        {job_description or "Not provided"}

        ADDITIONAL USER GUIDANCE:
        {improvement_instructions or "None"}

        RAW RESUME:

        {resume_text}

        FINAL OUTPUT STRUCTURE:

        FULL NAME

        Email | Phone | Location | LinkedIn (include only details present in the source)

        PROFESSIONAL SUMMARY

        TECHNICAL SKILLS

        PROFESSIONAL EXPERIENCE

        PROJECTS

        EDUCATION

        CERTIFICATIONS

        LANGUAGES

        
    """
    
    rewritten_resume = ask_gemini(prompt)
    if rewritten_resume == GEMINI_UNAVAILABLE_RESPONSE:
        return resume_text
    return rewritten_resume