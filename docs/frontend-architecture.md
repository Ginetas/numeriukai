# Frontend Architecture

The Next.js frontend uses modular components:

- `components/live/LiveVideoPlayer` renders HLS streams.
- `components/plate-event/*` renders plate event cards, modals, and bounding boxes.
- `components/ocr/*` provides OCR model tables, forms, and ensemble configuration.

Routes under `app/config` host camera live views and OCR configuration pages. Integration tests live in `frontend/tests/integration` to validate rendering of live video, event feeds, camera pages, and OCR configuration widgets.
