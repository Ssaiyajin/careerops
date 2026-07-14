import os
from sklearn.metrics.pairwise import cosine_similarity

model = None


def get_model():
    global model

    if model is None:
        from sentence_transformers import SentenceTransformer

        model = SentenceTransformer(
            "all-MiniLM-L6-v2"
        )

    return model


def semantic_job_match(
    resume_text,
    job_description
):
    enabled = os.getenv(
        "ENABLE_SEMANTIC_MATCHING",
        "true"
    ).lower() == "true"

    if not enabled:
        return {
            "semantic_match_score": None
        }

    model = get_model()

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