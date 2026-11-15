from pathlib import Path

from fastapi.testclient import TestClient

from app.db import connect, reset_database


def table_names(path: Path) -> set[str]:
    with connect(path) as conn:
        rows = conn.execute("SELECT name FROM sqlite_master WHERE type = 'table'")
        return {row["name"] for row in rows}


def test_reset_creates_schema(tmp_path: Path) -> None:
    path = tmp_path / "fresh.db"
    reset_database(path)
    assert table_names(path) == {"users"}


def test_reset_wipes_existing_data(tmp_path: Path) -> None:
    path = tmp_path / "old.db"
    reset_database(path)
    with connect(path) as conn:
        conn.execute("INSERT INTO users (email) VALUES ('a@example.com')")

    reset_database(path)

    with connect(path) as conn:
        assert conn.execute("SELECT COUNT(*) FROM users").fetchone()[0] == 0


def test_app_startup_resets_database(client: TestClient, db_path: Path) -> None:
    assert table_names(db_path) == {"users"}
