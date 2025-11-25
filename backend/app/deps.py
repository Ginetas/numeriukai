from __future__ import annotations

from contextlib import contextmanager
from sqlmodel import Session

from .database import engine


@contextmanager
def get_session():
    with Session(engine) as session:
        yield session
