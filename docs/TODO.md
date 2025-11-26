# Delivery roadmap

Vienas suvienodintas TODO ir roadmap dokumentas, skirtas aiškiai matyti pagrindinius darbus per edge, backend ir frontend sluoksnius.

## Bendra kryptis
- [ ] Tikras GStreamer pipeline ir RTSP atkūrimas.
- [ ] Realaus detektoriaus integracija (YOLO/PP-YOLOE) ir OCR modelių svorių krautuvai (CRNN, transformer).
- [ ] WebSocket įvykių srautas ir atnaujinimai fronte.
- [ ] AuthN/AuthZ ir multi-tenant.
- [ ] Eksportavimo atsarginė eilė su persistencija.

## Edge (Raspberry Pi + Hailo)
- [ ] Apibrėžti GStreamer pipeline, naudojant Pi hardware decoderį RTSP (H.264) ingestui ir paruošiant kadrus Hailo inferencijai.
- [ ] Integruoti YOLO numerių detektorių ir OCR (CNN+CTC) modelius su Hailo; užtikrinti modelių artefaktų versijavimą ir krovimą iš konfigo.
- [ ] Įgyvendinti crop/filter etapą, ištraukiant numerio regionus prieš OCR.
- [ ] Sukurti lengvą Python edge workerį, kuris skaito inferencijos išvestis, surenka `PlateEvent` (kamera, numeris, balas, timestamp) ir siunčia per HTTP/WebSocket.
- [ ] Pridėti struktūruotą loggą, bazinius metrikus ir rekonekcijos logiką patikimam streamingui.

## Backend (FastAPI + PostgreSQL)
- [ ] Sukurti DB schemas kameroms, zonoms, modeliams, integracijoms ir `PlateEvent` su migracijomis.
- [ ] Implementuoti ingest endpointus `PlateEvent` duomenims (validacija, autentifikacija).
- [ ] Eksponuoti konfigūracijos API (`cameras`, `zones`, `models`, `exporters`) ir `/healthz`.
- [ ] Paruošti WebSocket endpointą gyvam plokštelių įvykių srautui į frontendą.
- [ ] Pridėti background užduotis eksportavimo/integracijų workflow'ams (webhook, REST ir pan.).

## Frontend (Next.js)
- [ ] Gyvas dashboard su numeriu, kamera, timestamp ir confidence iš WebSocket srauto.
- [ ] Konfigūracijos puslapiai kameroms, modeliams, Hailo nustatymams ir integracijoms.
- [ ] Formos/validacija eksporteriams ir kitiems integracijos taškams valdyti.
- [ ] Filtravimas, paieška ir puslapiavimas istoriniams `PlateEvent` įrašams.

## Deployment & DevEx
- [ ] Dockerfile ir docker-compose edge bei backend servisams; dokumentuoti HW priklausomybes (Pi decoder, Hailo driveriai/runtime).
- [ ] Pridėti CI patikras (lint, type check, testai) ir pre-commit hooks.
- [ ] Parašyti setup gidus development, staging ir production aplinkoms.
