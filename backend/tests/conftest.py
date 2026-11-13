from collections.abc import Iterator
from pathlib import Path

import pytest
from fastapi.testclient import TestClient

from app.core.config import get_settings
from app.main import create_app


@pytest.fixture
def static_dir(tmp_path: Path) -> Path:
    """A stand-in for the exported frontend (frontend/out)."""
    out = tmp_path / "out"
    (out / "nda").mkdir(parents=True)
    (out / "index.html").write_text("<h1>home</h1>")
    (out / "nda" / "index.html").write_text("<h1>nda</h1>")
    return out


@pytest.fixture
def db_path(tmp_path: Path) -> Path:
    return tmp_path / "test.db"


@pytest.fixture
def client(
    monkeypatch: pytest.MonkeyPatch, db_path: Path, static_dir: Path
) -> Iterator[TestClient]:
    """App wired to temp paths; the context manager runs startup (database reset)."""
    monkeypatch.setenv("DATABASE_PATH", str(db_path))
    monkeypatch.setenv("STATIC_DIR", str(static_dir))
    get_settings.cache_clear()
    with TestClient(create_app()) as test_client:
        yield test_client
    get_settings.cache_clear()
