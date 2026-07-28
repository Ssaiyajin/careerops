from fastapi import APIRouter

router = APIRouter()

@router.get("/gemini-test")
def gemini_test():
    return {
        "message": "Gemini endpoint works"
    }