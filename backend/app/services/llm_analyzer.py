import ollama


def generate_ai_recommendations(
    text: str,
    selected_model: str
):

    print(f"USING MODEL: {selected_model}")

    # UI -> OLLAMA MODEL MAP
    model_map = {
        "mistral": "mistral:latest",
        "phi": "phi3:mini"
    }

    # fallback to mistral
    actual_model = model_map.get(
        selected_model,
        "mistral:latest"
    )

    prompt = f"""
    Analyze this resume and provide:

    1. ATS improvement suggestions
    2. Missing technical skills
    3. Resume improvement advice
    4. Career recommendations

    Resume:
    {text}
    """

    try:

        response = ollama.chat(
            model=actual_model,
            messages=[
                {
                    "role": "user",
                    "content": prompt,
                }
            ]
        )

        return response["message"]["content"]

    except Exception as e:

        print("OLLAMA ERROR:", str(e))

        # AUTO FALLBACK
        try:

            fallback_response = ollama.chat(
                model="mistral:latest",
                messages=[
                    {
                        "role": "user",
                        "content": prompt,
                    }
                ]
            )

            return fallback_response["message"]["content"]

        except Exception as fallback_error:

            return f"""
            AI analysis failed.

            Original Error:
            {str(e)}

            Fallback Error:
            {str(fallback_error)}
            """