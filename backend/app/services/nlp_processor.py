import spacy

# Load English NLP model
nlp = spacy.load("en_core_web_sm")


def process_text(text: str):

    doc = nlp(text)

    tokens = []

    for token in doc:

        # Ignore punctuation and spaces
        if not token.is_stop and not token.is_punct:
            tokens.append(token.text)

    return tokens