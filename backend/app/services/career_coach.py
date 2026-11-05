import logging
import os

from app.services.gemini_analyzer import get_client

logger = logging.getLogger(__name__)


class CareerCoachUnavailable(Exception):
    """Raised when the external Gemini career-coach service cannot respond."""


def generate_career_response(prompt: str) -> str:
    if not os.getenv("GEMINI_API_KEY"):
        raise CareerCoachUnavailable("Career coaching is not configured.")

    try:
        response = get_client().models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt,
        )
    except Exception as error:
        logger.exception("Gemini career-coach request failed")
        raise CareerCoachUnavailable(
            "Career coaching is temporarily unavailable. Please try again later."
        ) from error

    answer = getattr(response, "text", None)
    if not isinstance(answer, str) or not answer.strip():
        logger.error("Gemini career-coach request returned no text")
        raise CareerCoachUnavailable(
            "Career coaching returned no answer. Please try again."
        )

    return answer.strip()
