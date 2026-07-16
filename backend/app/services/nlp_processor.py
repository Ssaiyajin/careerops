import re
from app.core.nlp import get_nlp

STOPWORDS = {
    "a",
    "an",
    "and",
    "the",
    "is",
    "in",
    "to",
    "of",
    "for",
    "with",
    "on",
    "by",
    "that",
    "this",
    "it",
    "as",
}


def process_text(text: str):

    nlp = get_nlp()

    if nlp is None:
        tokens = re.findall(r"\b\w+\b", text)
        return [token for token in tokens if token.lower() not in STOPWORDS]

    doc = nlp(text)

    tokens = []

    for token in doc:

        # Ignore punctuation and spaces
        if not token.is_stop and not token.is_punct:
            tokens.append(token.text)

    return tokens