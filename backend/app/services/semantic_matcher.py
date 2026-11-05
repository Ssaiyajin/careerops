import logging
import re

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

logger = logging.getLogger(__name__)
EMBEDDING_MODEL = "gemini-embedding-001"


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


def _embedding_similarity(resume_text: str, job_description: str) -> float:
    from app.services.gemini_analyzer import get_client

    response = get_client().models.embed_content(
        model=EMBEDDING_MODEL,
        contents=[resume_text, job_description],
    )
    embeddings = getattr(response, "embeddings", None)
    if not embeddings or len(embeddings) != 2:
        raise ValueError("Gemini returned an unexpected number of embeddings")

    vectors = [getattr(embedding, "values", None) for embedding in embeddings]
    if any(not vector for vector in vectors):
        raise ValueError("Gemini returned an empty text embedding")

    return float(cosine_similarity([vectors[0]], [vectors[1]])[0][0])


def semantic_job_match(resume_text: str, job_description: str) -> dict[str, object]:
    cleaned_resume = re.sub(r"\s+", " ", resume_text).strip()
    cleaned_job = re.sub(r"\s+", " ", job_description).strip()
    if not cleaned_resume or not cleaned_job:
        return {
            "semantic_match_score": None,
            "semantic_match_method": "unavailable",
        }

    try:
        similarity = _embedding_similarity(cleaned_resume, cleaned_job)
        return {
            "semantic_match_score": round(max(0.0, similarity) * 100),
            "semantic_match_method": "gemini_embeddings",
        }
    except Exception:
        logger.exception(
            "Gemini semantic embedding failed; using lightweight text similarity"
        )

    return _text_similarity(cleaned_resume, cleaned_job)