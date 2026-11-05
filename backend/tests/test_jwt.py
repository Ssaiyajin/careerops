from datetime import datetime, timedelta, timezone

import jwt

from app.auth.jwt import ALGORITHM, SECRET_KEY, create_access_token, decode_access_token


def test_access_token_round_trips_claims():
    token = create_access_token({"sub": "user@example.com"})
    payload = decode_access_token(token)

    assert payload is not None
    assert payload["sub"] == "user@example.com"
    assert "exp" in payload


def test_access_token_rejects_expired_tokens():
    expired_token = jwt.encode(
        {
            "sub": "user@example.com",
            "exp": datetime.now(timezone.utc) - timedelta(minutes=1),
        },
        SECRET_KEY,
        algorithm=ALGORITHM,
    )

    assert decode_access_token(expired_token) is None


def test_access_token_rejects_invalid_tokens():
    assert decode_access_token("not-a-jwt") is None


def test_access_token_rejects_other_signing_algorithms():
    token = jwt.encode(
        {"sub": "user@example.com"},
        "x" * 64,
        algorithm="HS512",
    )

    assert decode_access_token(token) is None
