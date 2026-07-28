import os
from typing import Optional

_nlp = None


def get_nlp() -> Optional[object]:
    global _nlp

    if _nlp is not None:
        return _nlp

    if os.getenv("ENABLE_SPACY", "false").lower() not in ("1", "true", "yes"):
        return None

    import spacy

    _nlp = spacy.load("en_core_web_sm")
    return _nlp