from fastapi import APIRouter
from pydantic import BaseModel

from app.core.config import get_settings
from app.db import connect

router = APIRouter(tags=["health"])


class HealthResponse(BaseModel):
    status: str
    database: str


@router.get("/health", response_model=HealthResponse)
def health() -> HealthResponse:
    with connect(get_settings().database_path) as conn:
        conn.execute("SELECT 1")
    return HealthResponse(status="ok", database="ok")
