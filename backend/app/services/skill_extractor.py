import re

from app.core.skills import SKILLS


def extract_skills(text: str):

    extracted_skills = []

    lower_text = text.lower()

    for skill in SKILLS:

        # Create regex pattern with word boundaries
        pattern = r"\b" + re.escape(skill.lower()) + r"\b"

        if re.search(pattern, lower_text):
            extracted_skills.append(skill)

    return sorted(list(set(extracted_skills)))