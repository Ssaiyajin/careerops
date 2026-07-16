import os
from sklearn.metrics.pairwise import cosine_similarity

model = None


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

        model = SentenceTransformer("all-MiniLM-L6-v2")

    return model


def semantic_job_match(
    resume_text,
    job_description
):
    if not semantic_enabled():
        return {
            "semantic_match_score": None
        }

    model = get_model()
    if model is None:
        return {
            "semantic_match_score": None
        }

    resume_embedding = model.encode(
        [resume_text]
    )

    job_embedding = model.encode(
        [job_description]
    )

    similarity = cosine_similarity(
        resume_embedding,
        job_embedding
    )[0][0]

    return {
        "semantic_match_score": int(similarity * 100)
    }