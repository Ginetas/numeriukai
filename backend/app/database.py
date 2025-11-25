from __future__ import annotations

import os
import time
from typing import Generator

from sqlalchemy import create_engine
from sqlalchemy.exc import OperationalError
from sqlmodel import Session, SQLModel

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://anpr:anpr@db:5432/anpr")

def get_engine():
    return create_engine(DATABASE_URL, echo=False)


def wait_for_db(engine, retries: int = 10, delay: float = 1.0) -> None:
    for attempt in range(retries):
        try:
            with engine.connect():
                return
        except OperationalError:
            time.sleep(delay)
    raise RuntimeError("Database is not ready")


def init_db(engine=None) -> None:
    engine = engine or get_engine()
    SQLModel.metadata.create_all(engine)


def get_session() -> Generator[Session, None, None]:
    engine = get_engine()
    with Session(engine) as session:
        yield session
