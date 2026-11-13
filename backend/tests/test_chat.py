import json
from typing import Any

import pytest
from fastapi.testclient import TestClient

from app.nda import chat
from app.nda.models import AssistantTurn, ChatMessage, NdaFields, NdaUpdates

EMPTY_PARTY = {"name": "", "title": "", "company": "", "noticeAddress": ""}
FIELDS_JSON: dict[str, Any] = {
    "purpose": "Evaluating a partnership.",
    "effectiveDate": "2026-11-14",
    "mndaTermType": "fixed",
    "mndaTermYears": "1",
    "confidentialityType": "fixed",
    "confidentialityYears": "1",
    "governingLaw": "",
    "jurisdiction": "",
    "modifications": "",
    "party1": EMPTY_PARTY,
    "party2": EMPTY_PARTY,
}
NO_PARTY_UPDATES = {"name": None, "title": None, "company": None, "noticeAddress": None}


def make_updates(**changes: Any) -> NdaUpdates:
    """NdaUpdates with every field null except `changes` (camelCase keys)."""
    data = {key: None for key in FIELDS_JSON} | {
        "party1": NO_PARTY_UPDATES,
        "party2": NO_PARTY_UPDATES,
    }
    return NdaUpdates.model_validate(data | changes)


def fields() -> NdaFields:
    return NdaFields.model_validate(FIELDS_JSON)


def test_apply_updates_sets_only_non_null_values() -> None:
    updates = make_updates(
        governingLaw="Delaware",
        mndaTermYears=3,
        party2=NO_PARTY_UPDATES | {"company": "Globex"},
    )

    result = chat.apply_updates(fields(), updates)

    assert result.governing_law == "Delaware"
    assert result.mnda_term_years == "3"
    assert result.party2.company == "Globex"
    assert result.party2.name == ""
    assert result.purpose == "Evaluating a partnership."
    assert result.confidentiality_years == "1"


def test_apply_updates_with_nothing_learned_keeps_fields() -> None:
    assert chat.apply_updates(fields(), make_updates()) == fields()


def test_build_messages_puts_context_in_system_prompt() -> None:
    history = [ChatMessage(role="user", content="Hi")]

    messages = chat.build_messages(history, fields())

    assert messages[0]["role"] == "system"
    assert '"mndaTermYears": "1"' in messages[0]["content"]
    assert "Today is 20" in messages[0]["content"]
    assert messages[1:] == [{"role": "user", "content": "Hi"}]


def test_assistant_turn_schema_uses_camel_case() -> None:
    schema = json.dumps(AssistantTurn.model_json_schema())
    assert "noticeAddress" in schema
    assert "notice_address" not in schema


def test_chat_endpoint_returns_reply_and_merged_fields(
    client: TestClient, monkeypatch: pytest.MonkeyPatch
) -> None:
    def fake_complete(messages: list[dict[str, str]], schema: type) -> AssistantTurn:
        assert messages[-1] == {"role": "user", "content": "We are Acme Inc."}
        return AssistantTurn(
            reply="Thanks! Who is the other party?",
            updates=make_updates(party1=NO_PARTY_UPDATES | {"company": "Acme Inc."}),
        )

    monkeypatch.setattr(chat, "complete_structured", fake_complete)

    response = client.post(
        "/api/chat",
        json={
            "messages": [{"role": "user", "content": "We are Acme Inc."}],
            "fields": FIELDS_JSON,
        },
    )

    assert response.status_code == 200
    body = response.json()
    assert body["reply"] == "Thanks! Who is the other party?"
    assert body["fields"]["party1"] == EMPTY_PARTY | {"company": "Acme Inc."}
    assert body["fields"]["mndaTermYears"] == "1"


def test_chat_endpoint_reports_llm_failure_as_502(
    client: TestClient, monkeypatch: pytest.MonkeyPatch
) -> None:
    def failing_complete(*_: Any) -> AssistantTurn:
        raise RuntimeError("provider down")

    monkeypatch.setattr(chat, "complete_structured", failing_complete)

    response = client.post("/api/chat", json={"messages": [], "fields": FIELDS_JSON})

    assert response.status_code == 502
    assert "try again" in response.json()["detail"]


def test_chat_endpoint_rejects_invalid_fields(client: TestClient) -> None:
    bad = FIELDS_JSON | {"mndaTermType": "forever"}
    assert client.post("/api/chat", json={"messages": [], "fields": bad}).status_code == 422
