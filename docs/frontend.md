# Frontend (Next.js App Router)

The frontend is built with Next.js App Router, TypeScript, TailwindCSS, Zustand for UI state, and React Query for data fetching.

## Routes
- `/dashboard` – live plate event feed with WebSocket stream fallback to polling.
- `/config/cameras` – camera CRUD (RTSP, FPS, zone, enabled flag).
- `/config/zones` – zone CRUD with type and polygon stub.
- `/config/models` – detector/OCR/tracker models CRUD.
- `/config/sensors` – TPMS/loop/RFID sensors CRUD.
- `/integrations` – exporters CRUD + test endpoint trigger.

## State management
- **React Query** caches API responses and handles refetch.
- **Zustand** holds UI-only state (sidebar, selected events, live event buffer).
- Toast notifications via `ToastProvider`.

## Adding new CRUD views
1. Define TypeScript interfaces in `lib/types.ts`.
2. Add fetch hooks using `useApiQuery` and `useApiMutation`.
3. Build UI with shadcn-inspired components (Button, Input, Dialog, Table).
4. Wire forms to backend endpoints under `/config/*`.

## Event streaming
- WebSocket connection to `/events/stream` pushes new `PlateEvent` items into `useEventsStore`.
- If the socket closes, the UI falls back to polling `/events` every 10 seconds.

## Testing
Run unit tests from the frontend directory:

```bash
npm test
```
