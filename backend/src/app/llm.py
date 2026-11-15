"""LLM calls: gpt-oss-120b through OpenRouter, with Cerebras as the inference provider."""

from litellm import completion
from pydantic import BaseModel

from app.core.config import get_settings

MODEL = "openrouter/openai/gpt-oss-120b"
EXTRA_BODY = {"provider": {"order": ["cerebras"]}}


def complete_structured[T: BaseModel](messages: list[dict[str, str]], schema: type[T]) -> T:
    """Sends the chat messages and parses the reply as a Structured Output of `schema`."""
    response = completion(
        model=MODEL,
        messages=messages,
        response_format=schema,
        reasoning_effort="low",
        extra_body=EXTRA_BODY,
        api_key=get_settings().openrouter_api_key,
    )
    return schema.model_validate_json(response.choices[0].message.content)
