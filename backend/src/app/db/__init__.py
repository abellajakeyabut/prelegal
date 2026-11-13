"""Temporary SQLite database, recreated empty every time the app starts."""

import sqlite3
from collections.abc import Iterator
from contextlib import contextmanager
from pathlib import Path

SCHEMA = (Path(__file__).parent / "schema.sql").read_text()


def reset_database(path: Path) -> None:
    """Delete any existing database file and create a fresh one from the schema."""
    path.unlink(missing_ok=True)
    with connect(path) as conn:
        conn.executescript(SCHEMA)


@contextmanager
def connect(path: Path) -> Iterator[sqlite3.Connection]:
    """Open a connection that commits on success and is always closed."""
    conn = sqlite3.connect(path)
    conn.row_factory = sqlite3.Row
    try:
        with conn:
            yield conn
    finally:
        conn.close()
