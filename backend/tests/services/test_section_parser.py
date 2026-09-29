from app.services.section_parser import parse_resume_sections


def test_parse_resume_sections_detects_sections():
    text = """
    Experience
    Experienced engineer.

    Skills
    Python, Docker

    Projects
    Project A
    """

    result = parse_resume_sections(text)

    assert result["experience"] == "Experienced engineer."
    assert result["skills"] == "Python, Docker"
    assert result["projects"] == "Project A"
