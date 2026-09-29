from app.services.skill_extractor import extract_skills

def test_extract_skills():

    text = """
    Python Docker Kubernetes AWS Terraform FastAPI
    """

    skills = extract_skills(text)

    assert "Python" in skills
    assert "Docker" in skills
    assert "AWS" in skills