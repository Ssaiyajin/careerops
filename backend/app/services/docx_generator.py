from docx import Document


def generate_resume_docx(
    candidate_name: str,
    email: str,
    location: str,
    skills: list,
    resume_text: str,
    output_path: str
):

    document = Document()

    # Header
    document.add_heading(
        candidate_name,
        level=0
    )

    document.add_paragraph(
        f"{email} | {location}"
    )

    # Summary
    document.add_heading(
        "Professional Summary",
        level=1
    )

    document.add_paragraph(
        "Experienced software engineer with expertise in cloud technologies, DevOps, automation and software development."
    )

    # Skills
    document.add_heading(
        "Technical Skills",
        level=1
    )

    for skill in skills:

        document.add_paragraph(
            skill,
            style="List Bullet"
        )

    # Resume Content
    document.add_heading(
        "Experience & Projects",
        level=1
    )

    document.add_paragraph(
        resume_text
    )

    document.save(
        output_path
    )

    return output_path