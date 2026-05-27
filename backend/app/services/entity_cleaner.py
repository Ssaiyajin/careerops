import re


KNOWN_LOCATIONS = [
    "Germany",
    "Berlin",
    "Hamburg",
    "Munich",
    "London",
    "USA",
    "UK",
]


def clean_names(names, locations):

    cleaned = []

    for name in names:

        # remove duplicates
        if name in cleaned:
            continue

        # reject emails
        if "@" in name:
            continue

        # reject numbers
        if any(char.isdigit() for char in name):
            continue

        # reject locations accidentally classified as names
        if name in locations:
            continue

        # reject too short
        if len(name) < 3:
            continue

        cleaned.append(name)

    return cleaned


def clean_locations(locations):

    cleaned = []

    for location in locations:

        if location in cleaned:
            continue

        if location in KNOWN_LOCATIONS:
            cleaned.append(location)

    return cleaned


def extract_phone_numbers(text):

    PHONE_REGEX = r"(?:\+\d{1,3}[- ]?)?\d{8,15}"

    phones = re.findall(PHONE_REGEX, text)

    return list(set(phones))


def extract_dates(text):

    DATE_REGEX = r"\b(?:\d{2}/\d{4}|\d{4})\b"

    dates = re.findall(DATE_REGEX, text)

    return list(set(dates))