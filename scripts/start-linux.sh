#!/usr/bin/env bash
# Builds the Prelegal image and runs it at http://localhost:8000.
# The SQLite database is temporary: it starts empty on every run.
# Needs OPENROUTER_API_KEY in the repo-root .env for the AI chat.
set -euo pipefail

cd "$(dirname "$0")/.."
docker build -t prelegal .
docker rm -f prelegal >/dev/null 2>&1 || true
docker run -d --rm --name prelegal --env-file .env -p 8000:8000 prelegal >/dev/null
echo "Prelegal is running at http://localhost:8000"
