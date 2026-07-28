from app.services.ats_advisor import generate_ats_advice


def test_generate_ats_advice_minimal_text():
    ats_data = {"ats_score": 55}
    result = generate_ats_advice([
        "Python",
        "Docker"
    ], ats_data, "Experienced DevOps engineer with AWS and Terraform skills.")

    assert "recommendations" in result
    assert isinstance(result["recommendations"], list)
    assert "missing_keywords" in result


def test_generate_ats_advice_short_resume():
    ats_data = {"ats_score": 65}
    result = generate_ats_advice([], ats_data, "Short resume text")

    assert any("short" in rec.lower() for rec in result["recommendations"])
