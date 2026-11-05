"""Reserved extension point; no alternate or self-hosted provider is wired in."""


def generate_ai_response(provider: str, text: str, model: str) -> str:
    del text
    raise NotImplementedError(
        f"Alternative provider {provider!r} with model {model!r} is not supported."
    )