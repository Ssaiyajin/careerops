import re
import spacy

nlp = spacy.load("en_core_web_sm")


EMAIL_REGEX = r"[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+"

PHONE_REGEX = r"\+?\d[\d\s\-]{7,15}\d"


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

        cleaned.append(value)

    return sorted(list(set(cleaned)))


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

        # PERSON
        if ent.label_ == "PERSON":

            # Ignore values with digits
            if not any(char.isdigit() for char in value):
                entities["names"].append(value)

        # ORGANIZATION
        elif ent.label_ == "ORG":

            if len(value) > 2:
                entities["organizations"].append(value)

        # LOCATION
        elif ent.label_ == "GPE":

            if not any(char.isdigit() for char in value):
                entities["locations"].append(value)

        # DATE
        elif ent.label_ == "DATE":

            # Ignore phone-like values
            if not re.match(PHONE_REGEX, value):
                entities["dates"].append(value)

    # Emails
    emails = re.findall(EMAIL_REGEX, text)
    entities["emails"] = emails

    # Phones
    phones = re.findall(PHONE_REGEX, text)
    entities["phones"] = phones

    # Cleanup
    for key in entities:
        entities[key] = clean_entities(entities[key])

    return entities