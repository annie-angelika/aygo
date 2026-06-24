# API layer — backend contract

This folder is the **only** place the app talks to a backend. Feature code (hooks,
components, server pages) imports typed functions from `@/lib/api`; it never calls
`fetch` directly. That keeps the network surface — base URL, auth, error shape — in
one place, so wiring the real backend is a config change, not a refactor.

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

> **Discover (cities, interests, featured calendars) is intentionally NOT here.**
> Those modules (`lib/cities-data.ts`, `lib/discover-data.ts`) are presentation
> config — they carry React icon components and Tailwind class strings, which a
> JSON backend can't return. If the counts/calendars become dynamic, add a
> dedicated stats endpoint that returns *data only* (ids + numbers), and merge it
> over the local config; don't move the whole module behind the api.

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
| `fetchRegistrations()` | `GET /me/registrations` | → `{ going, applied, stamps }` | hydration seam |
| `fetchProfile()` | `GET /me/profile` | → `Partial<ProfileEdits>` | hydration seam |
| `fetchPreferences()` | `GET /me/preferences` | → `Preferences` | hydration seam |

The **hydration seams** (`fetch*`) load server state into the local cache on
sign-in. They're intentionally not called yet: naively writing server data over
localStorage would clobber unsynced offline changes, so the merge/conflict policy
is a backend-team decision. In mock mode they return `null` (keep local as-is).

## Local-first model

User-owned state (RSVPs, applications, stamps, profile, preferences) is written to
localStorage **first** and rendered immediately — the UI never blocks on the network.
The matching `api/*` call then syncs the change to the backend in the background.
On load, the `fetch*` functions hydrate the local cache from the server.

This is why the app feels instant and why it works offline. Types live in
`@/types`; consume everything through the `@/lib/api` barrel.
