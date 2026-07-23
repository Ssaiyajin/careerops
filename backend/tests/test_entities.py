from app.services.entity_extractor import extract_entities

def test_entity_extraction():

    text = """
    John Doe
    john@test.com
    +49123456789
    Berlin
    """

    entities = extract_entities(text)

    assert "john@test.com" in entities["emails"]
    assert len(entities["phones"]) > 0