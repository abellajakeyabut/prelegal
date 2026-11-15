# Prelegal

Monorepo for the Prelegal web app.

| Folder      | Stack                                   | Dev URL                      |
|-------------|-----------------------------------------|------------------------------|
| `backend/`  | Python 3.13, FastAPI, uv, SQLite, pytest, ruff | http://localhost:8000/docs |
| `frontend/` | Next.js (App Router, static export), TypeScript, Tailwind | http://localhost:3000 |

In production everything runs in one Docker container: Next.js is built as static
HTML and FastAPI serves it at `/` alongside the API at `/api`, on port 8000.

## Run with Docker

Put your OpenRouter key in a `.env` file at the repo root (it is git-ignored):

```bash
echo "OPENROUTER_API_KEY=sk-or-..." > .env
scripts/start-mac.sh      # or start-linux.sh, or scripts\start-windows.ps1
# open http://localhost:8000
scripts/stop-mac.sh       # or stop-linux.sh, or scripts\stop-windows.ps1
```

- **Login** is fake for now: any email and password are accepted and kept in the
  browser's `localStorage`. Every page except `/login` redirects there when logged out.
- **Database** is a temporary SQLite file (`backend/src/app/db/schema.sql`) that is
  deleted and recreated empty every time the app starts.

## Features

- **Mutual NDA Creator** (`/nda`): chat with an AI assistant that asks about the
  agreement and fills in the
  [Common Paper Mutual NDA](templates/Mutual-NDA-coverpage.md) as you answer. The
  preview updates live, and the finished NDA downloads as PDF (browser "Save as PDF")
  or Markdown. The conversation and draft are kept in `localStorage`.
  - `POST /api/chat` takes the conversation and current fields, and returns the
    assistant's reply and updated fields. It calls `gpt-oss-120b` through OpenRouter
    with Cerebras as the provider, using Structured Outputs (`backend/src/app/nda/`).
  - The page reads `templates/` from the repo root, so run the frontend from `frontend/`.

Legal templates live in [`templates/`](templates/) (CC BY 4.0, see
[`templates/LICENSE.txt`](templates/LICENSE.txt)) and are indexed in
[`catalog.json`](catalog.json).

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
cd frontend && npm test && npm run lint && npm run build
scripts/test-integration.sh   # builds and runs the Docker image end to end
```

Frontend unit tests use Node's built-in test runner (`node --test`, Node 24+ for
native TypeScript), so no extra test dependencies are needed.
