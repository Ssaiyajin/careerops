import os
import logging
import time

client = None
logger = logging.getLogger(__name__)
GEMINI_UNAVAILABLE_RESPONSE = "Gemini temporarily unavailable."


def get_client():
    global client

    if client is None:
        from google import genai

        client = genai.Client(
            api_key=os.getenv("GEMINI_API_KEY")
        )

    return client


def ask_gemini(prompt: str):

    try:
        client = get_client()
    except Exception:
        logger.exception("Failed to initialize Gemini client")
        return GEMINI_UNAVAILABLE_RESPONSE

    for attempt in range(3):

        try:

            response = client.models.generate_content(
                model="gemini-2.5-flash",
                contents=prompt
            )

            return response.text

        except Exception as e:

            logger.warning("Gemini attempt %s failed: %s", attempt + 1, e)

            time.sleep(2)

    return GEMINI_UNAVAILABLE_RESPONSE

def generate_gemini_recommendations(text: str):

    prompt = f"""
Analyze this resume and provide:

1. ATS improvement suggestions
2. Missing technical skills
3. Resume improvement advice
4. Career recommendations

Resume:

{text}
"""

    return ask_gemini(prompt)