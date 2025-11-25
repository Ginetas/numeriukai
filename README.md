# anpr-variklis

Pilnas ANPR/ALPR monorepo, skirtas edge (Raspberry Pi) įrenginiui su į debesį orientuotu backend ir Next.js valdymo pultu.

## Architektūra
- **Edge**: RTSP ingest (GStreamer stub), detekcija, centroid tracker, OCR ensemble, eksportuotojai (REST/WebSocket), TPMS klausytuvas.
- **Backend**: FastAPI + SQLModel + Postgres, CRUD routeriai, event ingest/stream, Alembic struktūra.
- **Frontend**: Next.js App Router + Zustand, valdymo pultas.
- **Deploy**: `docker-compose` su PostgreSQL, backend, frontend, edge.

### Tekstinė schema
```
[RTSP kamera] -> [Edge pipeline (detektorius + OCR + tracker)] -> [Exporter REST/WS] -> [FastAPI backend] -> [Postgres] -> [Next.js dashboard]
                                                     ^
                                             [TPMS/sensor listener]
```

## Katalogų struktūra
- `edge/` – ingest, detekcija, OCR ensemble, eksportuotojai, jutiklių listeneriai, YAML konfigas.
- `backend/` – FastAPI aplikacija, SQLModel modeliai, routeriai, Alembic.
- `frontend/` – Next.js App Router UI, Zustand store, API klientas.
- `deploy/` – `docker-compose.yml` ir Kubernetes stubas.
- `docs/` – architektūros, API ir edge konfigūracijos dokumentacija.

## Paleidimas lokaliai
1. **Prerequisites**: Docker, Docker Compose, Node 18+, Python 3.11.
2. **Aplinkos kintamieji**: nukopijuokite `.env.example` į `.env` ir pritaikykite.
3. **Startas**:
   ```bash
   cd deploy
   docker-compose up --build
   ```
   - Backend pasiekiamas per `http://localhost:8000`.
   - Frontend pasiekiamas per `http://localhost:3000`.

## Raspberry Pi / Edge diegimas
- Naudokite `edge/Dockerfile` buildinant ARM (`--platform linux/arm64`).
- Užtikrinkite GStreamer/OpenCV priklausomybes realiam ingestui.
- Coral/Hailo akseleratoriai gali būti integruoti `Detector` klasėje.

## Roadmap
- [ ] Tikras GStreamer pipeline ir RTSP atkūrimas
- [ ] Realaus detektoriaus integracija (YOLO/PP-YOLOE)
- [ ] OCR modelių svorių krautuvai (CRNN, transformer)
- [ ] WebSocket eventų srautas ir atnaujinimai fronte
- [ ] AuthN/AuthZ ir daugia-vartotojiškumas
- [ ] Eksportavimo atsarginė eilė su persistentu
