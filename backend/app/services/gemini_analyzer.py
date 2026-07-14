import os
import time

from google import genai
from dotenv import load_dotenv

load_dotenv()

client = None

def get_client():
    global client

    if client is None:
        client = genai.Client(
            api_key=os.getenv("GEMINI_API_KEY")
        )

    return client

def ask_gemini(prompt: str):

    for attempt in range(3):

        try:

            response = client.models.generate_content(
                model="gemini-2.5-flash",
                contents=prompt
            )

            return response.text

        except Exception as e:

            print(
                f"Gemini attempt {attempt + 1} failed:",
                e
            )

            time.sleep(2)

    return "Gemini temporarily unavailable."


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