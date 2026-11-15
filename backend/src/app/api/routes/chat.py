import logging

from fastapi import APIRouter, HTTPException

from app.nda.chat import chat_turn
from app.nda.models import ChatRequest, ChatResponse

logger = logging.getLogger(__name__)

router = APIRouter(tags=["chat"])


@router.post("/chat", response_model=ChatResponse)
def chat(request: ChatRequest) -> ChatResponse:
    """One turn of the Mutual NDA chat: the assistant's reply and the updated fields."""
    try:
        reply, fields = chat_turn(request.messages, request.fields)
    except Exception as error:
        logger.exception("NDA chat turn failed")
        raise HTTPException(502, "The AI assistant is unavailable. Please try again.") from error
    return ChatResponse(reply=reply, fields=fields)
