SECTION_KEYWORDS = {
    "education": [
        "education",
        "academic",
        "university",
        "bildung",
        "ausbildung",
        "berufsausbildung",
        "bildungsweg",
        "studium",
    ],

    "experience": [
        "experience",
        "employment",
        "work experience",
        "berufserfahrung",
        "beruflicher werdegang",
        "berufliche erfahrung",
    ],

    "projects": [
        "projects",
        "personal projects",
        "projekte",
    ],

    "skills": [
        "skills",
        "technical skills",
        "technologies",
        "kenntnisse",
        "fähigkeiten",
        "faehigkeiten",
        "kompetenzen",
    ],

    "certifications": [
        "certifications",
        "licenses",
        "certificates",
        "zertifikate",
        "zertifizierungen",
    ]
}


def parse_resume_sections(text: str):

    lines = text.split("\n")

    sections = {}

    current_section = "other"

    sections[current_section] = []

    for line in lines:

        clean_line = line.strip()

        if not clean_line:
            continue

        lower_line = clean_line.lower()

        found_new_section = False

        for section_name, keywords in SECTION_KEYWORDS.items():

            for keyword in keywords:
                if (
                    lower_line == keyword or
                    lower_line.startswith(f"{keyword} ") or
                    lower_line.startswith(f"{keyword}:")
                ):
                    current_section = section_name

                    if current_section not in sections:
                        sections[current_section] = []

                    found_new_section = True
                    break

            if found_new_section:
                break

        if not found_new_section:
            sections[current_section].append(clean_line)

    # Convert list -> text
    final_sections = {}

    for section, content in sections.items():

        final_sections[section] = "\n".join(content)

    return final_sections