import os
import sys

import pytest
from fastapi.testclient import TestClient
from sqlmodel import SQLModel, Session, create_engine

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.main import app
from app.deps import get_session
from app import models  # noqa: F401 ensures tables are registered


@pytest.fixture(name="session")
def session_fixture():
    from app import models  # noqa: F401

    engine = create_engine("sqlite:///./test.db", connect_args={"check_same_thread": False})
    SQLModel.metadata.create_all(engine)
    with Session(engine) as session:
        yield session


@pytest.fixture(name="client")
def client_fixture(session: Session):
    def get_session_override():
        yield session

    app.dependency_overrides[get_session] = get_session_override
    with TestClient(app) as client:
        yield client
    app.dependency_overrides.clear()
