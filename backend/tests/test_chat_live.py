"""Calls the real model via OpenRouter/Cerebras. Skipped unless OPENROUTER_API_KEY is set."""

import pytest

from app.core.config import get_settings
from app.nda.chat import chat_turn
from app.nda.models import ChatMessage, NdaFields
from tests.test_chat import FIELDS_JSON

pytestmark = pytest.mark.skipif(
    not get_settings().openrouter_api_key, reason="OPENROUTER_API_KEY not set"
)


def test_live_chat_turn_extracts_fields() -> None:
    message = ChatMessage(
        role="user",
        content="I'm Jane Doe, CEO of Acme Inc. We want Delaware law and a 3 year term.",
    )

    reply, fields = chat_turn([message], NdaFields.model_validate(FIELDS_JSON))

    assert reply
    assert fields.governing_law == "Delaware"
    assert fields.mnda_term_years == "3"
    assert fields.party1.company == "Acme Inc."
    assert fields.party1.name == "Jane Doe"
