import logging

from app.services import gemini_analyzer, resume_rewriter


def test_gemini_client_initialization_failure_is_nonfatal(monkeypatch, caplog):
    def fail_to_initialize():
        raise RuntimeError("Missing API key")

    monkeypatch.setattr(gemini_analyzer, "get_client", fail_to_initialize)

    with caplog.at_level(logging.ERROR, logger=gemini_analyzer.__name__):
        result = gemini_analyzer.ask_gemini("Analyze this resume")

    assert result == gemini_analyzer.GEMINI_UNAVAILABLE_RESPONSE
    assert "Failed to initialize Gemini client" in caplog.text


def test_resume_rewriter_returns_source_text_when_gemini_is_unavailable(monkeypatch):
    monkeypatch.setattr(
        resume_rewriter,
        "ask_gemini",
        lambda _: gemini_analyzer.GEMINI_UNAVAILABLE_RESPONSE,
    )
    source_resume = "Candidate Name\nPython developer"

    result = resume_rewriter.rewrite_resume(
        resume_text=source_resume,
        skills=["Python"],
        sections={},
        experience_level="Mid-level",
        ats_advice={},
    )

    assert result == source_resume
