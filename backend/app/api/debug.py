from fastapi import APIRouter
import os

router = APIRouter()

@router.get("/debug-key")
def debug_key():
    key = os.getenv("GEMINI_API_KEY")

    return {
        "loaded": key is not None,
        "starts_with": key[:10] if key else None
    }