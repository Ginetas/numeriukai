# Projekto statusas ir TODO

## Kas jau veikia
- **Backend**: veikia `FastAPI` aplikacija su sveikatos tikrinimu, pilnu CRUD maršrutų rinkiniu kameroms, zonomis, modelių konfigūracijoms, jutikliams ir eksporteriams bei įvykių ingestas/paieška. 【F:backend/app/main.py†L1-L17】【F:backend/app/routers/config.py†L1-L130】【F:backend/app/routers/events.py†L1-L41】【F:backend/app/routers/events.py†L43-L55】
- **Frontend**: Next.js dashboard puslapis rodo backend bazės adresą, leidžia filtruoti įvykius pagal numerį, kamerą, zoną ir laiko intervalą bei atvaizduoja lentelę su rezultatais. 【F:frontend/app/dashboard/page.tsx†L1-L111】【F:frontend/app/dashboard/page.tsx†L113-L177】
- **Edge**: egzistuoja pipeline karkasas su RTSP ingest stub'u, detektoriaus ir OCR ensemble vietomis bei eksportų dispatcher'iu, kuris generuoja testinius įvykius. 【F:edge/pipeline.py†L1-L67】【F:edge/pipeline.py†L69-L82】

## TODO
- **Realus RTSP ingest ir dekodavimas**: pakeisti `RTSPIngest` stub'ą tikra GStreamer/OpenCV implementacija ir pridėti parametrizuojamus įvesties šaltinius. 【F:edge/pipeline.py†L21-L35】
- **Detektorius ir OCR modeliai**: integruoti tikrus modelius (pvz., YOLO ir CRNN/transformer), užkrauti svorius iš konfigūracijos ir naudoti tikrus bounding box'ai/tekstą vietoje `_fake_plate`. 【F:edge/pipeline.py†L37-L68】【F:edge/pipeline.py†L74-L82】
- **Tracker'io ir export pipeline patikimumas**: išplėsti `CentroidTracker` ir `ExportDispatcher` kad turėtų persistenciją, retry eilę ir matomą eksporterių būseną vietoje tuščio `/exporters` atsakymo. 【F:edge/pipeline.py†L53-L67】【F:backend/app/routers/exporters.py†L1-L8】
- **Event stream ir notifikacijos**: įgyvendinti WebSocket srautą `/events/stream` (dabar tik placeholder) ir įtraukti live atnaujinimus į frontendą. 【F:backend/app/routers/events.py†L43-L55】【F:frontend/app/dashboard/page.tsx†L19-L111】
- **Autentikacija ir autorizacija**: pridėti vartotojų modelį, tokenų išdavimą ir rolėmis paremtą prieigą prie config/event API bei frontend UI.
- **Testavimas ir kokybės užtikrinimas**: pridėti vienetinius/integrocinius testus edge pipeline'ui ir frontend komponentams, suplanuoti load testus event ingestui ir paieškai.
- **Diegimas**: papildyti `docker-compose`/Kubernetes manifestus realiomis priklausomybėmis (modelių svoriai, akceleratoriai), atskirais environment konfiguraciniais failais ir observability (logs/metrics) integracija.
