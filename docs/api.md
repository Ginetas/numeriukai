# API

## Health
- `GET /healthz` – sveikatos patikra.

## Konfigūracija (`/config`)
- `POST /config/cameras` – sukuria kamerą.
- `GET /config/cameras` – sąrašas.
- `POST /config/zones`, `GET /config/zones` – zonų CRUD.
- `POST /config/models`, `GET /config/models` – modelių konfig.
- `POST /config/sensors`, `GET /config/sensors` – jutikliai.
- `POST /config/exporters`, `GET /config/exporters` – eksportuotojai.

## Eventai (`/events`)
- `POST /events/ingest` – priima `PlateEvent` JSON.
- `WS /events/stream` – WebSocket srautas (stubas grąžina placeholder).

## Exporters
- `GET /exporters/` – eksportuotojų statusas (stubas).
