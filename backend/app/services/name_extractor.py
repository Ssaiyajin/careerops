import re

BANNED_WORDS = [
    "resume",
    "developer",
    "engineer",
    "aws",
    "docker",
    "kubernetes",
    "terraform",
    "python",
    "java",
    "javascript",
    "typescript",
    "react",
    "next.js",
    "bamberg",
    "germany",
]


def looks_like_name(line: str):

    words = line.split()

    # Usually names are 2-3 words
    if len(words) < 2 or len(words) > 4:
        return False

    for word in words:

        # Ignore weird tokens
        if not word.replace("-", "").isalpha():
            return False

    return True


def extract_name(text: str):

    lines = text.split("\n")

    for line in lines[:15]:

        line = line.strip()

        if len(line) < 3:
            continue

        # Ignore emails
        if "@" in line:
            continue

        # Ignore numbers
        if any(char.isdigit() for char in line):
            continue

        # Ignore long lines
        if len(line.split()) > 4:
            continue

        lower_line = line.lower()

        # Ignore banned words
        if any(word in lower_line for word in BANNED_WORDS):
            continue

        # Detect actual names
        if looks_like_name(line):
            return line.title()

    return "Unknown Candidate"