"""Mutual NDA chat models. JSON uses camelCase to match the frontend's NdaFormData."""

from typing import Literal

from pydantic import BaseModel, ConfigDict
from pydantic.alias_generators import to_camel


class CamelModel(BaseModel):
    model_config = ConfigDict(alias_generator=to_camel, validate_by_name=True)


class Party(CamelModel):
    name: str
    title: str
    company: str
    notice_address: str


class NdaFields(CamelModel):
    """Everything filled in on the MNDA Cover Page. Years are strings, as in the form."""

    purpose: str
    effective_date: str
    mnda_term_type: Literal["fixed", "untilTerminated"]
    mnda_term_years: str
    confidentiality_type: Literal["fixed", "perpetual"]
    confidentiality_years: str
    governing_law: str
    jurisdiction: str
    modifications: str
    party1: Party
    party2: Party


class PartyUpdates(CamelModel):
    name: str | None
    title: str | None
    company: str | None
    notice_address: str | None


class NdaUpdates(CamelModel):
    """Fields the model learned this turn; null means unchanged."""

    purpose: str | None
    effective_date: str | None
    mnda_term_type: Literal["fixed", "untilTerminated"] | None
    mnda_term_years: int | None
    confidentiality_type: Literal["fixed", "perpetual"] | None
    confidentiality_years: int | None
    governing_law: str | None
    jurisdiction: str | None
    modifications: str | None
    party1: PartyUpdates
    party2: PartyUpdates


class AssistantTurn(CamelModel):
    """The model's Structured Output for one chat turn.

    `updates` comes first so the model commits to the values before writing a
    reply that describes them; otherwise the reply can claim changes it never made.
    """

    updates: NdaUpdates
    reply: str


class ChatMessage(BaseModel):
    role: Literal["user", "assistant"]
    content: str


class ChatRequest(CamelModel):
    messages: list[ChatMessage]
    fields: NdaFields


class ChatResponse(CamelModel):
    reply: str
    fields: NdaFields
