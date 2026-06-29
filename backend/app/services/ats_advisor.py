from app.core.skills import SKILLS


def generate_ats_advice(
    extracted_skills,
    ats_data,
    text
):
    missing_keywords = []

    lower_text = text.lower()

    for skill in SKILLS:

        if skill.lower() not in lower_text:
            missing_keywords.append(skill)

    recommendations = []

    if ats_data["ats_score"] < 70:
        recommendations.append(
            "Resume ATS score is below 70. Add more relevant technical keywords."
        )

    if len(extracted_skills) < 8:
        recommendations.append(
            "Add more technical skills related to your target role."
        )

    if "Professional Summary" not in text:
        recommendations.append(
            "Add a Professional Summary section."
        )

    if len(text.split()) < 300:
        recommendations.append(
            "Resume appears short. Expand project and experience descriptions."
        )

    return {
        "missing_keywords": missing_keywords[:10],
        "recommendations": recommendations
    }