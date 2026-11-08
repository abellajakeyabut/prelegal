# Prelegal

Monorepo for the Prelegal web app.

| Folder      | Stack                                   | Dev URL                      |
|-------------|-----------------------------------------|------------------------------|
| `backend/`  | Python 3.13, FastAPI, uv, pytest, ruff  | http://localhost:8000/docs   |
| `frontend/` | Next.js (App Router), TypeScript, Tailwind | http://localhost:3000     |

## Features

- **Mutual NDA Creator** (`/nda`): fill in the key terms in a form, see the
  [Common Paper Mutual NDA](templates/Mutual-NDA-coverpage.md) completed live,
  and download it as PDF (browser "Save as PDF") or Markdown. Everything runs
  in the browser; drafts are kept in `localStorage`. See [docs/PLAN.md](docs/PLAN.md).
  The page reads `templates/` from the repo root, so run the frontend from `frontend/`.

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
```

Frontend unit tests use Node's built-in test runner (`node --test`, Node 24+ for
native TypeScript), so no extra test dependencies are needed.
