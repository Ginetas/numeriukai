# Frontend guide

This document summarizes how the Next.js frontend is structured, how to configure it, and conventions for adding new features.

## App structure
- **App Router**: The project uses the Next.js App Router with `appDir` enabled. Pages live under `app/`, with a shared shell defined in `app/layout.tsx`. The root layout wires the sidebar navigation to dashboard and config sections and wraps page content in the main column.【F:frontend/next.config.js†L1-L6】【F:frontend/app/layout.tsx†L10-L29】
- **Primary routes**: Dashboard data views are under `app/dashboard`, integrations under `app/integrations`, and configuration pages under `app/config/*` (cameras, zones, models, sensors). Each route is a standalone React component rendered by the App Router.【F:frontend/app/dashboard/page.tsx†L24-L170】【F:frontend/app/config/cameras/page.tsx†L17-L125】【F:frontend/app/integrations/page.tsx†L1-L8】
- **Shared components**: Reusable UI primitives (buttons, inputs, dialogs, cards, toasts, selects) live in `components/ui/`. Domain-specific builders like the zone designer live under namespaced folders such as `components/zone-designer/` for composing polygons and related tooling.【F:frontend/components/ui/button.tsx†L1-L200】【F:frontend/components/zone-designer/ZoneDesigner.tsx†L1-L200】
- **State management**: Local reactive state uses Zustand stores in `store/`. For example, `store/events.ts` keeps a capped list of recent plate events and exposes `useEventStore` for components to read and push updates.【F:frontend/store/events.ts†L1-L18】
- **Data access**: API helpers in `lib/api.ts` centralize calls to the backend (health, configuration CRUD, event search, and exporters). Components import these helpers rather than calling `fetch` directly.【F:frontend/lib/api.ts†L1-L54】

## Environment variables and feature flags
- **Backend target**: `NEXT_PUBLIC_BACKEND_URL` points the frontend at the API gateway. It defaults to `http://localhost:8000` when unset, so set it in `.env.local` when pointing to another environment.【F:frontend/lib/api.ts†L1-L21】
- **Optional flags**: Add additional `NEXT_PUBLIC_*` values for client-side feature toggles (for example, `NEXT_PUBLIC_ENABLE_EXPORTERS=true`). Reference them via `process.env.NEXT_PUBLIC_FEATURE` in client components to gate new UI. Keep defaults in code so local development still works without extra configuration.

## Styling system
- **Tailwind CSS** powers styling. Global directives live in `app/globals.css`, and Tailwind scans `app/**/*` and `components/**/*` for class names per `tailwind.config.js`. Use utility classes for layout and spacing; add minimal custom CSS to `globals.css` when needed.【F:frontend/app/globals.css†L1-L11】【F:frontend/tailwind.config.js†L1-L11】
- **Design language**: Prefer the shared primitives in `components/ui/` before introducing new styles to keep consistency. Compose utility classes on top of those components when extending behavior.

## Running the app
- Install dependencies with `npm install` (or `pnpm install` if you standardize on pnpm).
- **Development**: `npm run dev` starts Next.js in App Router mode at `http://localhost:3000`. Hot reloading is enabled.【F:frontend/package.json†L5-L18】
- **Production build**: `npm run build` compiles the app, and `npm start` serves the optimized output.【F:frontend/package.json†L5-L9】
- **Linting**: `npm run lint` runs Next.js lint (ESLint) checks.【F:frontend/package.json†L5-L9】

## Configuring dashboards and data views
- The dashboard uses query-string driven filters (`plate`, `camera_id`, `zone_id`, `from_ts`) stored in the URL, so widgets stay shareable and restorable on refresh. Use `useSearchParams` and `router.replace` as in `app/dashboard/page.tsx` when building new filters.【F:frontend/app/dashboard/page.tsx†L19-L136】
- Load reference data (cameras, zones) alongside metrics so filter dropdowns render meaningful labels. Seed queries with sensible defaults (e.g., `limit=50`).【F:frontend/app/dashboard/page.tsx†L43-L166】
- Keep tables responsive by wrapping them in bordered, scrollable containers and providing empty states for no data.【F:frontend/app/dashboard/page.tsx†L138-L169】

## Adding new config pages
1. Create a directory under `app/config/<feature>` with a `page.tsx` component. Follow the existing pages for structure: heading, description, error surface, form, and list table.
2. Use the centralized `api` client for CRUD calls; add new namespaces to `lib/api.ts` if the backend exposes more endpoints.【F:frontend/lib/api.ts†L23-L54】
3. Mirror UX from existing screens: inline forms for creation, table listing with action buttons, optimistic reload after mutations. For geo/visual editors, colocate helpers under `components/<feature>/` similar to the zone designer.
4. Wire navigation by adding a `Link` in `app/layout.tsx` so the page appears in the sidebar.【F:frontend/app/layout.tsx†L15-L24】

## Recommended UX patterns
- **URL-driven state** for filters and pagination to keep pages shareable (see dashboard filters).【F:frontend/app/dashboard/page.tsx†L33-L136】
- **Inline validation**: surface API errors near forms (as done in camera and zone pages) and prevent submissions when required fields are missing or shapes are invalid.【F:frontend/app/config/cameras/page.tsx†L17-L87】【F:frontend/app/config/zones/page.tsx†L13-L90】
- **Optimistic refresh**: after create/update/delete, reload data lists so the UI stays in sync with the backend.【F:frontend/app/config/cameras/page.tsx†L19-L124】【F:frontend/app/config/zones/page.tsx†L20-L127】
- **Empty and loading states**: show friendly placeholders when no data is available to guide users on next steps.【F:frontend/app/dashboard/page.tsx†L150-L167】【F:frontend/app/config/cameras/page.tsx†L112-L123】
- **Composable primitives**: build new controls with shared UI components and Tailwind utilities to keep spacing and typography consistent.【F:frontend/app/globals.css†L1-L11】【F:frontend/components/ui/button.tsx†L1-L200】

## Example: configuring dashboards
- Add a new metric section by extending `app/dashboard/page.tsx`: fetch data via `api.<resource>` inside `useEffect`, store it in local state, and render using responsive grids or tables. Reuse the `updateQuery` helper pattern so users can filter by the new metric via the URL.【F:frontend/app/dashboard/page.tsx†L33-L169】
- To display event streams, push updates into `useEventStore` (or a new store) to allow multiple widgets to react to the same data source.【F:frontend/store/events.ts†L10-L18】

## Example: adding another config page
- Suppose you need to manage alert rules:
  1. Add `app/config/alerts/page.tsx` with a client component (`'use client';`). Start with heading, description, and an error banner.
  2. Implement form controls for rule name, thresholds, and targets; on submit, call `api.alerts.create` (add this namespace to `lib/api.ts`).【F:frontend/lib/api.ts†L23-L54】
  3. Render a table of existing alerts with action buttons (edit/delete) mirroring the camera table structure for consistency.【F:frontend/app/config/cameras/page.tsx†L85-L169】
  4. Add a sidebar link in `app/layout.tsx` for navigation.【F:frontend/app/layout.tsx†L15-L24】

## How to build and lint before shipping
- Run `npm run lint` to catch lint issues early.【F:frontend/package.json†L5-L9】
- Run `npm run build` to ensure production compilation succeeds. Address any environment variable requirements by setting `NEXT_PUBLIC_BACKEND_URL` in `.env.local` before building.【F:frontend/lib/api.ts†L1-L21】【F:frontend/package.json†L5-L9】
