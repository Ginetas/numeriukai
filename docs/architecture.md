# Architektūra

## Srautas
1. Edge pipeline priima RTSP kadrus iš kamerų.
2. Detektorius atpažįsta numerių regionus, centroid tracker seka objektus.
3. OCR ensemble (CRNN + transformer + tesseract adapteris) balsuoja dėl galutinio numerio.
4. Eventai siunčiami REST arba WebSocket eksportuotojais į backend.
5. Backend priima ir saugo `PlateEvent` į Postgres per SQLModel.
6. Frontend per API/WS pateikia dashboard vaizdus ir konfigūraciją.

## Komponentai
- **Edge**: `pipeline.py`, `tracker.py`, `ocr/ensemble.py`, `sensors/tpms_listener.py`, `exporters/*`.
- **Backend**: `app/main.py`, routeriai, `models.py`, `database.py`, Alembic.
- **Frontend**: Next.js App Router, Zustand store, `lib/api.ts`.
- **Deploy**: `deploy/docker-compose.yml`, `deploy/k8s/` stubas.
