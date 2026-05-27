import re
import spacy

nlp = spacy.load("en_core_web_sm")


EMAIL_REGEX = r"[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+"

PHONE_REGEX = r"(?:\+\d{1,3}[- ]?)?\d[\d\s\-]{7,15}\d"

DATE_REGEX = r"\b(?:\d{2}/\d{4}|\d{4})\b"


KNOWN_LOCATIONS = [
    "Germany",
    "Berlin",
    "Hamburg",
    "Munich",
    "London",
    "USA",
    "UK",
]


def clean_entities(values):

    cleaned = []

    for value in values:

        value = value.strip()

        # Ignore tiny values
        if len(value) < 2:
            continue

        # Ignore pure numbers
        if value.isdigit():
            continue

        # Remove duplicates
        if value not in cleaned:
            cleaned.append(value)

    return cleaned


def extract_entities(text: str):

    doc = nlp(text)

    entities = {
        "names": [],
        "organizations": [],
        "locations": [],
        "dates": [],
        "emails": [],
        "phones": []
    }

    for ent in doc.ents:

        value = ent.text.strip()

        # ======================
        # PERSON
        # ======================
        if ent.label_ == "PERSON":

            # Ignore digits
            if any(char.isdigit() for char in value):
                continue

            # Ignore emails
            if "@" in value:
                continue

            # Ignore known locations
            if value in KNOWN_LOCATIONS:
                continue

            # Ignore programming languages / tech terms
            banned_names = [
                "Python",
                "Java",
                "JavaScript",
                "TypeScript",
                "C",
                "C++",
                "C#",
                "Docker",
                "Kubernetes",
                "Terraform",
                "AWS",
                "Azure",
                "GCP",
                "FastAPI",
                "React",
                "Next.js",
                "Node.js",
                "Machine Learning",
                "Deep Learning",
            ]

            if value in banned_names:
                continue

            # Ignore long weird entities
            if len(value.split()) > 4:
                continue

            # Usually real names are alphabetic
            if not any(char.isalpha() for char in value):
                continue

            entities["names"].append(value)

        # ======================
        # ORGANIZATION
        # ======================
        elif ent.label_ == "ORG":

            if len(value) > 2:

                # Ignore phone-like orgs
                if not re.match(PHONE_REGEX, value):
                    entities["organizations"].append(value)

        # ======================
        # LOCATIONS
        # ======================
        elif ent.label_ in ["GPE", "LOC"]:

            # Ignore numeric locations
            if any(char.isdigit() for char in value):
                continue

            entities["locations"].append(value)

    # ======================
    # EMAILS
    # ======================
    emails = re.findall(EMAIL_REGEX, text)
    entities["emails"] = list(set(emails))

    # ======================
    # PHONES
    # ======================
    phones = re.findall(PHONE_REGEX, text)
    entities["phones"] = list(set(phones))

    # ======================
    # DATES
    # ======================
    dates = re.findall(DATE_REGEX, text)
    entities["dates"] = list(set(dates))

    # ======================
    # CLEANUP
    # ======================
    for key in entities:
        entities[key] = clean_entities(entities[key])

    return entities