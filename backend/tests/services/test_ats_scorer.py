from app.services.ats_scorer import calculate_ats_score

def test_ats_score():

    skills = [
        "Python",
        "Docker",
        "AWS"
    ]

    entities = {
        "emails": ["test@test.com"]
    }

    result = calculate_ats_score(
        skills,
        entities,
        "Sample Resume"
    )

    assert "ats_score" in result