# Stage 1: build the Next.js frontend as static HTML (frontend/out).
FROM node:24-slim AS frontend
WORKDIR /app/frontend
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci
COPY frontend/ ./
# The NDA page reads ../templates at build time.
COPY templates/ /app/templates/
RUN npm run build

# Stage 2: FastAPI serves the API and the static frontend on one port.
FROM python:3.13-slim
COPY --from=ghcr.io/astral-sh/uv:0.12.22 /uv /bin/uv
ENV UV_COMPILE_BYTECODE=1 UV_LINK_MODE=copy
WORKDIR /app/backend
COPY backend/pyproject.toml backend/uv.lock backend/README.md ./
RUN uv sync --frozen --no-dev --no-install-project
COPY backend/src ./src
RUN uv sync --frozen --no-dev
COPY --from=frontend /app/frontend/out /app/frontend/out

ENV STATIC_DIR=/app/frontend/out DATABASE_PATH=/app/backend/prelegal.db
EXPOSE 8000
CMD ["uv", "run", "--no-sync", "fastapi", "run", "src/app/main.py", "--port", "8000"]
