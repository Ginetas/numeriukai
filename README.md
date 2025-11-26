# anpr-variklis

Pilnas ANPR/ALPR monorepo, skirtas edge (Raspberry Pi) įrenginiui su į debesį orientuotu backend ir Next.js valdymo pultu.

## Architektūra
- **Edge**: RTSP ingest (GStreamer/OpenCV), YOLO ONNX detektorius, centroid tracker, LPRNet OCR, eksportuotojai (REST/WebSocket) su retry eile, TPMS klausytuvas.
- **Backend**: FastAPI + SQLModel + Postgres, CRUD routeriai, event ingest/stream, Alembic migracijos.
- **Frontend**: Next.js App Router + Zustand, valdymo pultas su backend health indikatoriumi.
- **Deploy**: `docker-compose` su PostgreSQL, backend, frontend, edge.

### Tekstinė schema
```
[RTSP kamera] -> [Edge pipeline (detektorius + OCR + tracker)] -> [Exporter REST/WS] -> [FastAPI backend] -> [Postgres] -> [Next.js dashboard]
                                                     ^
                                             [TPMS/sensor listener]
```

## Katalogų struktūra
- `edge/` – ingest, detekcija, OCR ensemble, eksportuotojai, jutiklių listeneriai, YAML konfigas.
- `backend/` – FastAPI aplikacija, SQLModel modeliai, routeriai, Alembic ir starto skriptas.
- `frontend/` – Next.js App Router UI, Zustand store, API klientas.
- `deploy/` – `docker-compose.yml` (identiskas šakniniam) ir Kubernetes stubas.
- `docs/` – architektūros, API ir edge konfigūracijos dokumentacija (žiūrėkite [Zone Designer gidą](docs/zone-designer.md)).

## Quick start
1. **Prerequisites**: Docker, Docker Compose, Node 18+, Python 3.11.
2. **Aplinkos kintamieji**: nukopijuokite `.env.example` į `.env` ir pritaikykite.
3. **Startas** (iš repo šaknies):
   ```bash
   docker-compose up --build
   ```
   - Backend pasiekiamas per `http://localhost:8000`.
   - Frontend pasiekiamas per `http://localhost:3000`.
   - Edge konteineris prijungia RTSP srautą, detekuoja numerius, atlieka OCR ir siunčia realius įvykius į backend `/events/ingest`.

### 📦 Instalacija

**Linux**
```bash
./scripts/install_anpr_linux.sh
```

**Raspberry Pi**
```bash
./scripts/install_anpr_rpi.sh
```

## Backend
- Stack: FastAPI, SQLModel, Alembic, Postgres.
- Pagrindiniai maršrutai: `/healthz`, `/config/*` CRUD stubai, `/events/ingest`, `/events/stream` (stub).
- Migracijos: Alembic bazinė migracija `0001_create_core_tables` kuria reikalingas lenteles.
- Starto skriptas `backend/start.sh` laukia DB, paleidžia migracijas ir startuoja `uvicorn`.

### Testing
```bash
cd backend
pytest
```

## Frontend
- Next.js (App Router) su TypeScript ir Zustand.
- Sidebar nuorodos į dashboard, konfigūracijos puslapius ir integracijas.
- `/dashboard` puslapis tikrina backend `/healthz` ir rodo statusą UI kortelėje.

## Edge
- `edge/pipeline.py` jungiasi prie RTSP (`edge/ingest.py`), detekuoja numerius su YOLO ONNX (`edge/detector.py`), seka objektus (`edge/tracker.py`) ir atlieka LPRNet OCR (`edge/ocr/lprnet.py`).
- `edge/event_builder.py` sukuria `PlateEvent` su JPEG kadru ir crop, eksportuojamus per REST/WebSocket.
- Modelių svoriai automatiškai atsiunčiami jei jų nėra (`models/detector`, `models/ocr`).
- `EdgeConfig` kraunamas iš YAML (`EDGE_CONFIG`) ir gali būti perrašomas `BACKEND_API_URL`.
- Startas vykdomas per `python start.py` konteineryje.

## Raspberry Pi / Edge diegimas
- Naudokite `edge/Dockerfile` buildinant ARM (`--platform linux/arm64`).
- Užtikrinkite GStreamer/OpenCV priklausomybes realiam ingestui ir akceleratorių tvarkykles (Coral/Hailo) detektoriui.

## Roadmap
- [x] Tikras GStreamer pipeline ir RTSP atkūrimas
- [x] Realaus detektoriaus integracija (YOLO ONNX)
- [x] OCR modelių svorių krautuvai (LPRNet)
- [ ] WebSocket eventų srautas ir atnaujinimai fronte
- [ ] AuthN/AuthZ ir multi-tenant
- [ ] Eksportavimo atsarginė eilė su persistentu
