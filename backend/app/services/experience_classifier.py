import re


def classify_experience(text: str):

    text_lower = text.lower()

    # Find explicit years
    years_matches = re.findall(
        r"(\d+)\+?\s+years",
        text_lower
    )

    max_years = 0

    if years_matches:
        max_years = max(
            [int(year) for year in years_matches]
        )

    # Strong senior indicators
    senior_keywords = [
        "senior engineer",
        "lead engineer",
        "tech lead",
        "principal engineer",
        "software architect",
        "staff engineer",
    ]

    # Strong mid indicators
    mid_keywords = [
        "software engineer",
        "devops engineer",
        "cloud engineer",
        "backend engineer",
        "full stack developer",
    ]

    # Senior logic
    if max_years >= 8:
        return "Senior"

    if any(keyword in text_lower for keyword in senior_keywords):
        return "Senior"

    # Mid logic
    if max_years >= 3:
        return "Mid"

    if any(keyword in text_lower for keyword in mid_keywords):
        return "Mid"

    # Default
    return "Junior"