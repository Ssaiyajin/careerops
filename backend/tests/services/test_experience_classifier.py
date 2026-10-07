from app.services.experience_classifier import classify_experience

def test_experience_level():

    text = """
    Software Engineer
    2019 - 2025
    """

    result = classify_experience(text)

    assert result is not None