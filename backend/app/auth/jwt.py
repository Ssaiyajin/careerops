import os
from datetime import datetime, timedelta, timezone
from jose import jwt, JWTError

SECRET_KEY = os.getenv("JWT_SECRET_KEY")
ALGORITHM = "HS256"

if not SECRET_KEY:
    # Fail loudly rather than silently signing tokens with a
    # well-known default that anyone reading the source could forge.
    raise RuntimeError(
        "JWT_SECRET_KEY is not set. Generate one with "
        "`python -c \"import secrets; print(secrets.token_urlsafe(32))\"` "
        "and set it in backend/.env"
    )


def create_access_token(data: dict, expires_minutes: int = 60):
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(minutes=expires_minutes)
    to_encode.update({"exp": expire})

    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


def decode_access_token(token: str):
    try:
        return jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    except JWTError:
        return None
