# Project TODO

High-level tasks to ship the end-to-end ANPR system across edge, backend, and frontend components.

## Edge (Raspberry Pi + Hailo)
- Define a GStreamer pipeline that uses the Pi hardware decoder for RTSP (H.264) ingestion and outputs frames resized/formatted for Hailo inference.
- Integrate the YOLO plate detector and OCR (CNN+CTC) models with Hailo, ensuring model artifacts are versioned and loaded from configuration.
- Implement a crop/filter stage that extracts plate regions in hardware before OCR.
- Build a lightweight Python edge worker to read inference outputs, assemble `PlateEvent` payloads (camera ID, plate text, scores, timestamps), and send them via HTTP/WebSocket.
- Add structured logging, basic metrics, and reconnection logic for resilient streaming.

## Backend (FastAPI + PostgreSQL)
- Create database schemas for cameras, zones, models, integrations, and plate events with migrations.
- Implement ingestion endpoints for `PlateEvent` data, including validation and authentication.
- Expose configuration APIs (cameras, zones, models, exporters) and `/healthz`.
- Provide a WebSocket endpoint for live plate event streaming to the frontend.
- Add background tasks for export/integration workflows (webhooks, REST, etc.).

## Frontend (Next.js)
- Build a live dashboard showing plate number, camera, timestamp, and confidence from the WebSocket feed.
- Implement configuration pages for cameras, models, Hailo settings, and integrations.
- Add forms/validation for managing exporters and other integration targets.
- Include filtering, search, and pagination for historical plate events.

## Deployment & DevEx
- Provide Dockerfiles/docker-compose for edge and backend services; document hardware dependencies (Pi decoder, Hailo drivers/runtime).
- Add CI checks (lint, type check, tests) and pre-commit hooks.
- Write setup guides for development, staging, and production environments.
