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

### Frontend roadmap (prioritetai)
1. **Real-time streaming UX**: pagerinti WebSocket srautą (loading/rekonekcija, playback greitis, atgalinė peržiūra) ir vizualiai išskirti aukšto/žemo confidence įvykius.
2. **Išplėstinis filtravimas ir puslapiavimas**: server-side paieška, data range filtrai, kamera/zona/modelis filtrai ir numatytas rūšiavimas pagal laiką/svorį.
3. **Formų validacijos šablonai**: pakartotinai naudojami hookai/schema kameroms, zonom, modeliams ir exporter konfigūracijoms; inline klaidos, numatytos reikšmės ir „save as draft“.
4. **Klaidų ir reporting strategija**: globalus „toast“/banneris API klaidoms, form error rail, ir žurnalų/pastabų siuntimas į backendą (feedback modalas).
5. **Prieinamumo (a11y) sąrašas**: focus state, keyboard navigation, ARIA labeliai, spalvų kontrasto patikra ir „skip to content“ nuoroda.
6. **Dizaino sistemos konsolidacija**: centralizuoti UI primitives (buttons, inputs, kortelės), paletė ir tipografija; dokumentuoti komponentų naudojimą.
7. **Testavimas**: vienetų testai komponentams (hooks/store) ir Playwright srautai (auth, dashboard, konfigūracija, filtrai).
8. **Deploy konfigai**: atskiri Next.js build profiliai (dev/staging/prod), aplinkos kintamųjų matrica ir observability (Sentry/otel) jungtys.

## Deployment & DevEx
- [ ] Dockerfile ir docker-compose edge bei backend servisams; dokumentuoti HW priklausomybes (Pi decoder, Hailo driveriai/runtime).
- [ ] Pridėti CI patikras (lint, type check, testai) ir pre-commit hooks.
- [ ] Parašyti setup gidus development, staging ir production aplinkoms.
