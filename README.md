# Prelegal

Monorepo for the Prelegal web app.

| Folder      | Stack                                   | Dev URL                      |
|-------------|-----------------------------------------|------------------------------|
| `backend/`  | Python 3.13, FastAPI, uv, pytest, ruff  | http://localhost:8000/docs   |
| `frontend/` | Next.js (App Router), TypeScript, Tailwind | http://localhost:3000     |

## Prerequisites

- [uv](https://docs.astral.sh/uv/) (Python)
- Node.js 20+ and npm

## Getting started

```bash
# Backend
cd backend
cp .env.example .env
uv sync
uv run fastapi dev src/app/main.py

# Frontend (in another terminal)
cd frontend
cp .env.example .env.local
npm install
npm run dev
```

## Checks

```bash
cd backend && uv run pytest && uv run ruff check .
cd frontend && npm run lint && npm run build
```
