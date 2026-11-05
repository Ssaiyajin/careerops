from types import SimpleNamespace

import pytest

from app.core import nlp
from app.services.entity_extractor import extract_entities
from app.services.experience_classifier import classify_experience
from app.services.section_parser import parse_resume_sections


def test_cv_language_selects_the_matching_spacy_pipeline(monkeypatch):
    loaded_models = []
    pipelines = {
        "en_core_web_sm": object(),
        "de_core_news_sm": object(),
    }
    monkeypatch.setenv("ENABLE_SPACY", "true")
    monkeypatch.setattr(nlp, "_nlp_models", {})
    monkeypatch.setitem(
        __import__("sys").modules,
        "spacy",
        SimpleNamespace(load=lambda name: loaded_models.append(name) or pipelines[name]),
    )

    assert nlp.get_nlp("en") is pipelines["en_core_web_sm"]
    assert nlp.get_nlp("de") is pipelines["de_core_news_sm"]
    assert loaded_models == ["en_core_web_sm", "de_core_news_sm"]


def test_german_name_entities_and_resume_sections_are_recognized(monkeypatch):
    entity = SimpleNamespace(text="Maja Mustermann", label_="PER")
    monkeypatch.setattr(
        "app.services.entity_extractor.get_nlp",
        lambda language: SimpleNamespace(ents=[entity]) if language == "de" else None,
    )

    extracted = extract_entities("Maja Mustermann\nBerlin", language="de")
    sections = parse_resume_sections(
        "Berufserfahrung\nCloud Engineer\nAusbildung\nInformatik"
    )

    assert extracted["names"] == ["Maja Mustermann"]
    assert sections["experience"] == "Cloud Engineer"
    assert sections["education"] == "Informatik"


def test_experience_classifier_recognizes_german_years_and_role_titles():
    assert classify_experience("Mehr als 8 Jahre Erfahrung als Ingenieur") == "Senior"
    assert classify_experience("Softwareentwickler mit 4 Jahre Erfahrung") == "Mid"


def test_nlp_rejects_unsupported_cv_language(monkeypatch):
    monkeypatch.setenv("ENABLE_SPACY", "true")

    with pytest.raises(ValueError, match="Unsupported CV language"):
        nlp.get_nlp("fr")
