import os

from google import genai
from dotenv import load_dotenv

load_dotenv()

client = genai.Client(
    api_key=os.getenv("GEMINI_API_KEY")
)

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

    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=prompt
    )

    return response.text