"""One turn of the Mutual NDA chat: ask the model, then apply the fields it learned."""

from datetime import date

from app.llm import complete_structured
from app.nda.models import AssistantTurn, ChatMessage, NdaFields, NdaUpdates

SYSTEM_PROMPT = """\
You are Prelegal's assistant. You help the user complete a Mutual Non-Disclosure \
Agreement (the Common Paper Mutual NDA v1.0) by chatting with them.

Your job each turn:
1. Read the user's latest message and record any field values it gives you in `updates`.
2. Write a short, friendly `reply` that asks for one or two of the fields still missing.
   Only say you recorded a value if it is in `updates`.

Fields (camelCase keys, as in `updates`):
- purpose: why the parties will share confidential information.
- effectiveDate: the date the MNDA starts, as YYYY-MM-DD. Today is {today}.
- mndaTermType: "fixed" (expires after a number of years) or "untilTerminated".
- mndaTermYears: whole number of years from 1 to 10, only when mndaTermType is "fixed".
- confidentialityType: "fixed" (number of years) or "perpetual".
- confidentialityYears: whole number of years from 1 to 10, only when confidentialityType \
is "fixed".
- governingLaw: the full name of a US state or "District of Columbia", e.g. "Delaware".
- jurisdiction: the courts that hear disputes, e.g. "courts located in New Castle, DE".
- modifications: any changes to the standard terms; empty if none.
- party1 and party2, each with: name (person signing), title, company, and noticeAddress \
(an email or postal address for legal notices).

Rules:
- Set a field in `updates` only when the user has given or confirmed it; otherwise null.
- To change a value the user corrects, send the new value.
- Purpose, dates and terms already have sensible defaults. Mention them so the user can \
confirm or change them, but focus on the empty fields first.
- If an answer is invalid (e.g. a foreign governing law or 15 years), explain the limit \
and ask again.
- Write plain text: no emoji and no markdown formatting.
- Do not give legal advice. When every field is complete, say the NDA is ready to \
download and suggest the user has a lawyer review it.

Current field values:
{fields}
"""


def build_messages(messages: list[ChatMessage], fields: NdaFields) -> list[dict[str, str]]:
    """The system prompt with today's date and current values, then the conversation."""
    system = SYSTEM_PROMPT.format(
        today=date.today().isoformat(),
        fields=fields.model_dump_json(by_alias=True, indent=2),
    )
    return [{"role": "system", "content": system}, *(m.model_dump() for m in messages)]


def apply_updates(fields: NdaFields, updates: NdaUpdates) -> NdaFields:
    """Returns `fields` with every non-null update applied."""
    changes = updates.model_dump(exclude_none=True, exclude={"party1", "party2"})
    for key in ("mnda_term_years", "confidentiality_years"):
        if key in changes:
            changes[key] = str(changes[key])
    for key in ("party1", "party2"):
        party = getattr(fields, key)
        changes[key] = party.model_copy(update=getattr(updates, key).model_dump(exclude_none=True))
    return fields.model_copy(update=changes)


def chat_turn(messages: list[ChatMessage], fields: NdaFields) -> tuple[str, NdaFields]:
    """Asks the model for its reply and returns it with the updated fields."""
    turn = complete_structured(build_messages(messages, fields), AssistantTurn)
    return turn.reply, apply_updates(fields, turn.updates)
