#!/usr/bin/env bash
set -euo pipefail

export DATABASE_URL="${DATABASE_URL:-postgresql://anpr:anpr@db:5432/anpr}"

python - <<'PY'
import time
import os
from sqlalchemy import create_engine
from sqlalchemy.exc import OperationalError

url = os.environ.get('DATABASE_URL')
engine = create_engine(url)
for attempt in range(10):
    try:
        with engine.connect():
            break
    except OperationalError:
        time.sleep(1)
else:
    raise SystemExit("Database not ready")
PY

alembic upgrade head
exec uvicorn app.main:app --host 0.0.0.0 --port 8000
