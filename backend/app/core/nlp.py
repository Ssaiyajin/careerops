import os

import logging

logger = logging.getLogger(__name__)
_nlp_models: dict[str, object] = {}
_MODEL_BY_LANGUAGE = {
    "en": "en_core_web_sm",
    "de": "de_core_news_sm",
}


def get_nlp(language: str = "en") -> object | None:
    if language not in _MODEL_BY_LANGUAGE:
        raise ValueError(f"Unsupported CV language: {language}")

    if os.getenv("ENABLE_SPACY", "true").lower() not in ("1", "true", "yes"):
        return None

    if language in _nlp_models:
        return _nlp_models[language]

    import spacy

    model_name = _MODEL_BY_LANGUAGE[language]
    try:
        nlp = spacy.load(model_name)
    except OSError as error:
        logger.exception("Configured spaCy model %s could not be loaded", model_name)
        raise RuntimeError(
            f"The {language} CV analysis model ({model_name}) is not installed."
        ) from error

    _nlp_models[language] = nlp
    return nlp