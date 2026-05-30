def calculate_ats_score(skills, entities, text):

    score = 50

    recommendations = []

    # Skill richness
    if len(skills) >= 10:
        score += 20
    elif len(skills) >= 5:
        score += 10
    else:
        recommendations.append(
            "Add more technical skills to improve ATS visibility."
        )

    # Email exists
    if entities.get("emails"):
        score += 5
    else:
        recommendations.append(
            "Add a professional email address."
        )

    # Phone exists
    if entities.get("phones"):
        score += 5
    else:
        recommendations.append(
            "Add a phone number."
        )

    # Resume length
    word_count = len(text.split())

    if word_count > 300:
        score += 10
    else:
        recommendations.append(
            "Resume content is too short."
        )

    # Certifications
    cert_keywords = [
        "AWS",
        "Azure",
        "Terraform",
        "Kubernetes",
        "Docker",
        "Certified",
    ]

    if any(cert.lower() in text.lower() for cert in cert_keywords):
        score += 10

    # Cap score
    score = min(score, 100)

    return {
        "ats_score": score,
        "recommendations": recommendations
    }