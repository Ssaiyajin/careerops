import os
import logging
import re

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

model = None
logger = logging.getLogger(__name__)


def _text_similarity(resume_text: str, job_description: str) -> dict[str, object]:
    vectorizer = TfidfVectorizer(
        analyzer="word",
        ngram_range=(1, 2),
        sublinear_tf=True,
        token_pattern=r"(?u)\b[\w+#.-]+\b",
    )
    try:
        vectors = vectorizer.fit_transform([resume_text, job_description])
    except ValueError:
        return {
            "semantic_match_score": 0,
            "semantic_match_method": "text_similarity",
        }

    similarity = float(cosine_similarity(vectors[0:1], vectors[1:2])[0][0])
    return {
        "semantic_match_score": round(similarity * 100),
        "semantic_match_method": "text_similarity",
    }


def semantic_enabled() -> bool:
    return os.getenv("ENABLE_SEMANTIC_MATCHING", "false").lower() in (
        "1",
        "true",
        "yes",
    )


def get_model():
    global model

    if model is None:
        try:
            from sentence_transformers import SentenceTransformer
        except ImportError:
            return None

        try:
            model = SentenceTransformer("all-MiniLM-L6-v2")
        except Exception:
            logger.exception("Semantic embedding model could not be loaded")
            return None

    return model


def semantic_job_match(resume_text: str, job_description: str) -> dict[str, object]:
    cleaned_resume = re.sub(r"\s+", " ", resume_text).strip()
    cleaned_job = re.sub(r"\s+", " ", job_description).strip()
    if not cleaned_resume or not cleaned_job:
        return {
            "semantic_match_score": None,
            "semantic_match_method": "unavailable",
        }

    if semantic_enabled():
        embedding_model = get_model()
        if embedding_model is not None:
            try:
                embeddings = embedding_model.encode([cleaned_resume, cleaned_job])
                similarity = float(
                    cosine_similarity(
                        [embeddings[0]],
                        [embeddings[1]],
                    )[0][0]
                )
                return {
                    "semantic_match_score": round(max(0.0, similarity) * 100),
                    "semantic_match_method": "sentence_embeddings",
                }
            except Exception:
                logger.exception(
                    "Semantic embedding failed; using lightweight text similarity"
                )

    return _text_similarity(cleaned_resume, cleaned_job)