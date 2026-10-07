from app.services.semantic_matcher import semantic_job_match


def test_semantic_match_returns_lightweight_score_when_embeddings_are_disabled(
    monkeypatch,
):
    monkeypatch.delenv("ENABLE_SEMANTIC_MATCHING", raising=False)

    result = semantic_job_match(
        "Python developer building APIs with Docker and Kubernetes",
        "Python developer role working with Docker and Kubernetes",
    )

    assert result["semantic_match_method"] == "text_similarity"
    assert isinstance(result["semantic_match_score"], int)
    assert 0 < result["semantic_match_score"] <= 100


def test_semantic_match_returns_zero_for_unrelated_content(monkeypatch):
    monkeypatch.setenv("ENABLE_SEMANTIC_MATCHING", "false")

    result = semantic_job_match(
        "Classical violin performance and music theory",
        "Agricultural irrigation and crop rotation management",
    )

    assert result["semantic_match_method"] == "text_similarity"
    assert result["semantic_match_score"] <= 10


def test_semantic_match_marks_empty_input_unavailable():
    result = semantic_job_match("  ", "Software engineer")

    assert result == {
        "semantic_match_score": None,
        "semantic_match_method": "unavailable",
    }
