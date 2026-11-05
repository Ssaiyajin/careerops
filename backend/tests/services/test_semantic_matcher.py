import logging
from types import SimpleNamespace

from app.services import gemini_analyzer
from app.services.semantic_matcher import semantic_job_match


def test_semantic_match_uses_gemini_embeddings_by_default(monkeypatch):
    models = SimpleNamespace(
        embed_content=lambda **kwargs: SimpleNamespace(
            embeddings=[
                SimpleNamespace(values=[1.0, 0.0, 0.0]),
                SimpleNamespace(values=[0.8, 0.2, 0.0]),
            ]
        )
    )
    client = SimpleNamespace(models=models)
    monkeypatch.setattr(gemini_analyzer, "get_client", lambda: client)
    embed_calls = []

    def embed_content(**kwargs):
        embed_calls.append(kwargs)
        return SimpleNamespace(
            embeddings=[
                SimpleNamespace(values=[1.0, 0.0, 0.0]),
                SimpleNamespace(values=[0.8, 0.2, 0.0]),
            ]
        )

    models.embed_content = embed_content
    result = semantic_job_match(
        "Python developer building APIs with Docker",
        "Cloud engineer working on Python services and containers",
    )

    assert result == {
        "semantic_match_score": 97,
        "semantic_match_method": "gemini_embeddings",
    }
    assert embed_calls == [
        {
            "model": "gemini-embedding-001",
            "contents": [
                "Python developer building APIs with Docker",
                "Cloud engineer working on Python services and containers",
            ],
        }
    ]


def test_semantic_match_uses_logged_tfidf_fallback_when_embeddings_fail(
    monkeypatch, caplog
):
    def fail_to_embed():
        raise RuntimeError("Embedding service unavailable")

    monkeypatch.setattr(gemini_analyzer, "get_client", fail_to_embed)

    with caplog.at_level(logging.ERROR, logger="app.services.semantic_matcher"):
        result = semantic_job_match(
            "Python developer building APIs with Docker and Kubernetes",
            "Python developer role working with Docker and Kubernetes",
        )

    assert result["semantic_match_method"] == "text_similarity"
    assert isinstance(result["semantic_match_score"], int)
    assert 0 < result["semantic_match_score"] <= 100
    assert "Gemini semantic embedding failed" in caplog.text


def test_semantic_match_returns_zero_for_unrelated_content(monkeypatch, caplog):
    monkeypatch.setattr(
        gemini_analyzer,
        "get_client",
        lambda: (_ for _ in ()).throw(RuntimeError("No API key")),
    )

    with caplog.at_level(logging.ERROR, logger="app.services.semantic_matcher"):
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
