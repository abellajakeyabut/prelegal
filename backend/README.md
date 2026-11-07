# Backend (FastAPI)

```bash
cp .env.example .env
uv sync
uv run fastapi dev src/app/main.py   # http://localhost:8000/docs
uv run pytest
uv run ruff check . && uv run ruff format .
```
