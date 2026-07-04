# API layer — backend contract

This folder is the **only** place the app talks to a backend. Feature code (hooks,
components, server pages) imports typed functions from `@/lib/api`; it never calls
`fetch` directly. That keeps the network surface — base URL, auth, error shape — in
one place, so wiring the real backend is a config change, not a refactor.

## The backend is implemented

These endpoints are live as Next route handlers under `app/api/`, backed by a
swappable store (`lib/server/store/`: `memory` or `postgres`/Neon, chosen by
`AYGO_DATA_SOURCE`). Guests are identified by a signed cookie
(`lib/server/session.ts`). First-time setup: `POST /api/admin/seed` with the
`x-admin-token` header creates the schema and seeds the catalog.

**Client vs. server data access:** the client hooks call these HTTP endpoints.
Server Components do **not** — they read the catalog straight from the data
modules (`lib/events-data.ts`), which is also the seed source, so there's no
self-fetch over HTTP and no relative-URL pitfall at build time.

## How it works today (mock mode)

`NEXT_PUBLIC_API_URL` is unset → `USE_MOCK` is `true` → every function resolves from
the bundled mock data (`lib/*-data.ts`) and localStorage. The app is fully usable
with no backend.

## Turning the backend on

1. Implement the endpoints below (the app's own Next route handlers under `/api`, or
   any host).
2. Set `NEXT_PUBLIC_API_URL=/api` (same-origin) — or an absolute URL.
3. Done. Every `api/*` function flips from mock to real calls; no feature code
   changes.

Auth: the session is a signed cookie (`AYGO_SESSION_SECRET`), sent automatically via
`credentials: "include"`. For token auth, call `setAuthToken(jwt)` after login.

## Endpoints

All paths are relative to `NEXT_PUBLIC_API_URL`. `me` = the signed-in user (from the
session cookie / bearer token).

Each row is marked **wired** (already consumed by the app) or **seam** (ready for
the backend; the screen still reads mock/config synchronously until you migrate it).

### Catalog (read)

| Function | Method & path | Returns | |
| --- | --- | --- | --- |
| `fetchEvents()` | `GET /events` | `AygoEvent[]` | wired |
| `fetchEventByCode(code)` | `GET /events/by-code/:code` | `AygoEvent` | wired |
| `fetchEvent(id)` | `GET /events/:id` | `AygoEvent` | seam |
| `fetchTraveler(username)` | `GET /users/:username` | `TravelerProfile` | seam |
| `fetchAttendees(eventId)` | `GET /events/:id/attendees` | `TravelerProfile[]` | seam |

### Discover (read)

| Function | Method & path | Returns | |
| --- | --- | --- | --- |
| `fetchCities()` | `GET /cities` | `CityInfo[]` (real, computed event counts) | wired |
| `fetchCalendars()` | `GET /calendars` | `CalendarInfo[]` | wired |
| `fetchCategoryStats()` | `GET /categories` | `CategoryStat[]` (real counts) | wired |

> Only the **serializable halves** live in the backend (`cities`, `calendars`,
> `category_pages` tables, seeded from `lib/cities-data.ts` /
> `lib/discover-data.ts`). Icons and Tailwind class strings stay client-side as
> presentation maps keyed by slug/category (`withCityMeta`, `CATEGORY_META`).
> Event counts are computed from the live events table — never stored.

### Admin (dashboard at `/admin`)

| Function | Method & path | Notes |
| --- | --- | --- |
| `fetchAdminSession()` | `GET /admin/session` | is this browser an admin? |
| `adminLogin(key)` | `POST /admin/session` | exchanges `AYGO_ADMIN_TOKEN` for a signed httpOnly cookie |
| `adminLogout()` | `DELETE /admin/session` | |
| `fetchAdminStats()` | `GET /admin/stats` | totals + recent creations (admin only) |
| `adminSeed()` | `POST /admin/seed` | re-seed the catalog (admin cookie or `x-admin-token` header) |
| `adminUpsertEvent(input)` | `POST /admin/events` | create/update a catalog event (server derives day labels, id from title) |
| `adminDeleteEvent(id)` | `DELETE /admin/events/:id` | removes catalog or user-created events + every guest reference |
| `adminUpsertCalendar(input)` | `POST /admin/calendars` | create/update a featured calendar |
| `adminDeleteCalendar(id)` | `DELETE /admin/calendars/:id` | |

Import these from `@/lib/api/admin` (not the barrel) so they never ride in app
bundles. Security boundary = the admin key; Pollar login is the identity layer
in the dashboard UI (Pollar doesn't yet issue a token our backend can verify).

### The signed-in user (read + write, local-first)

| Function | Method & path | Body | |
| --- | --- | --- | --- |
| `rsvp(eventId)` | `POST /me/registrations/:eventId` | — | wired |
| `cancelRsvp(eventId)` | `DELETE /me/registrations/:eventId` | — | wired |
| `applyToEvent(eventId, message?)` | `POST /me/applications/:eventId` | `{ message }` | wired |
| `withdrawApplication(eventId)` | `DELETE /me/applications/:eventId` | — | wired |
| `collectStamp(eventId)` | `POST /me/stamps` | `{ eventId }` | wired |
| `saveProfile(edits)` | `PUT /me/profile` | `ProfileEdits` | wired |
| `savePreferences(prefs)` | `PUT /me/preferences` | `Preferences` | wired |
| `createEvent(draft)` | `POST /events` | `EventDraft` | wired |

Created events are stored per-guest and **projected into the catalog** at read
time (`lib/server/store/draft-event.ts`): they come back from `GET /events`
(newest first) as regular `AygoEvent`s with the creator's saved profile as the
host, resolve by id and by share code, and their `/<code>` page renders
server-side for anyone with the link.
| `fetchRegistrations()` | `GET /me/registrations` | → `{ going, applied, stamps }` | wired |
| `fetchProfile()` | `GET /me/profile` | → `Partial<ProfileEdits>` | wired |
| `fetchPreferences()` | `GET /me/preferences` | → `Preferences` | wired |

The **hydration** functions (`fetch*`) are called once per page load by
`hooks/use-server-sync.ts` (mounted in the root layout via
`components/layout/server-sync.tsx`). Merge policy: lists (going / applied /
stamps) are **unioned** — server rows are adopted locally and local-only rows
are pushed up as unsynced offline writes; profile and preferences keep the
local copy when one exists (pushing it up if it differs) and adopt the
server's otherwise. In mock mode they return `null` (keep local as-is).

## Local-first model

User-owned state (RSVPs, applications, stamps, profile, preferences) is written to
localStorage **first** and rendered immediately — the UI never blocks on the network.
The matching `api/*` call then syncs the change to the backend in the background.
On load, the `fetch*` functions hydrate the local cache from the server.

This is why the app feels instant and why it works offline. Types live in
`@/types`; consume everything through the `@/lib/api` barrel.
