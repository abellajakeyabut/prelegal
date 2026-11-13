#!/usr/bin/env bash
# End-to-end check of the Docker image: start, hit every page and the API,
# confirm the database is reset on restart, then stop.
set -euo pipefail

cd "$(dirname "$0")/.."
BASE=http://localhost:8000

wait_for_health() {
  for _ in $(seq 1 30); do
    curl -fs "$BASE/api/health" >/dev/null && return 0
    sleep 1
  done
  echo "FAIL: app did not become healthy" >&2
  return 1
}

check() {
  local path=$1 expected=$2
  if curl -fsL "$BASE$path" | grep -q "$expected"; then
    echo "ok   $path"
  else
    echo "FAIL $path (expected '$expected')" >&2
    exit 1
  fi
}

user_count() {
  docker exec prelegal uv run --no-sync python -c \
    "import sqlite3; print(sqlite3.connect('prelegal.db').execute('SELECT COUNT(*) FROM users').fetchone()[0])"
}

trap 'docker stop prelegal >/dev/null 2>&1 || true' EXIT

scripts/start-mac.sh
wait_for_health

check /api/health '"database":"ok"'
check / 'Prelegal'
check /login 'Log in'
check /nda 'Mutual NDA Creator'
check /nda/ 'Standard Terms'

# One live AI chat turn (needs OPENROUTER_API_KEY in .env).
chat_body='{"messages":[{"role":"user","content":"We are Acme Inc. and want Delaware law."}],
  "fields":{"purpose":"x","effectiveDate":"2026-11-14","mndaTermType":"fixed","mndaTermYears":"1",
  "confidentialityType":"fixed","confidentialityYears":"1","governingLaw":"","jurisdiction":"",
  "modifications":"","party1":{"name":"","title":"","company":"","noticeAddress":""},
  "party2":{"name":"","title":"","company":"","noticeAddress":""}}}'
if curl -fs -X POST "$BASE/api/chat" -H 'Content-Type: application/json' -d "$chat_body" \
  | grep -q '"governingLaw":"Delaware"'; then
  echo "ok   /api/chat"
else
  echo "FAIL /api/chat" >&2
  exit 1
fi

docker exec prelegal uv run --no-sync python -c \
  "import sqlite3; c = sqlite3.connect('prelegal.db'); c.execute(\"INSERT INTO users (email) VALUES ('a@example.com')\"); c.commit()"
[ "$(user_count)" = 1 ] || { echo "FAIL: insert" >&2; exit 1; }

scripts/stop-mac.sh
scripts/start-mac.sh
wait_for_health
[ "$(user_count)" = 0 ] && echo "ok   database reset on restart" || { echo "FAIL: database not reset" >&2; exit 1; }

scripts/stop-mac.sh
echo "All integration checks passed"
