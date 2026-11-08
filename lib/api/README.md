# API layer — backend contract

This folder is the **only** place the app talks to a backend. Feature code (hooks,
components, server pages) imports typed functions from `@/lib/api`; it never calls
`fetch` directly. That keeps the network surface — base URL, auth, error shape — in
one place, so wiring the real backend is a config change, not a refactor.

## The backend

The endpoints are Next route handlers under `app/api/`, backed by a swappable
store (`lib/server/store/`: `memory` for local dev or `postgres`/Neon, chosen by
`AYGO_DATA_SOURCE`). Guests are identified by a signed cookie
(`lib/server/session.ts`); a sign-in binds that session to a server-verified
account (see *Accounts* below). First-time setup: `POST /api/admin/seed` with
the `x-admin-token` header creates the schema and seeds the discover content
(cities, calendars, interest pages). **No demo events or people are ever
seeded** — everything guests see is created in the app.

**Client vs. server data access:** the client hooks call these HTTP endpoints.
Server Components (e.g. `/[slug]`) read the store directly, so there's no
self-fetch over HTTP and no relative-URL pitfall at build time.

`NEXT_PUBLIC_API_URL` defaults to the same-origin `/api`; set it only to point
the client at another host. The session cookie rides on every call via
`credentials: "include"`; for token auth, call `setAuthToken(jwt)`.

## Endpoints

All paths are relative to `NEXT_PUBLIC_API_URL`. `me` = the signed-in user (from the
session cookie / bearer token).

### Catalog (read)

| Function | Method & path | Returns |
| --- | --- | --- |
| `fetchEvents()` | `GET /events` | `AygoEvent[]` |
| `fetchEventByCode(code)` | `GET /events/by-code/:code` | `AygoEvent` |
| `fetchAttendees(eventId)` | `GET /events/:id/attendees` | `Attendee[]` (real RSVPs, `username` when they have one) |
| `fetchPublicProfile(username)` | `GET /users/:username` | `PublicProfile` (identity, collection, public hosted events) |

`/profile` is always **you**; `/u/<username>` is anyone's public profile.

### Discover (read)

| Function | Method & path | Returns |
| --- | --- | --- |
| `fetchCities()` | `GET /cities` | `CityInfo[]` (real, computed event counts) |
| `fetchCalendars()` | `GET /calendars` | `CalendarInfo[]` |
| `fetchCategoryStats()` | `GET /categories` | `CategoryStat[]` (real counts) |

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
bundles. Security boundary = the admin key.

### The signed-in user (read + write, local-first)

| Function | Method & path | Body |
| --- | --- | --- |
| `rsvp(eventId)` | `POST /me/registrations/:eventId` | — |
| `cancelRsvp(eventId)` | `DELETE /me/registrations/:eventId` | — |
| `applyToEvent(eventId, message?)` | `POST /me/applications/:eventId` | `{ message }` |
| `withdrawApplication(eventId)` | `DELETE /me/applications/:eventId` | — |
| `collectStamp(eventId)` | `POST /me/stamps` | `{ eventId }` |
| `saveProfile(edits)` | `PUT /me/profile` | `ProfileEdits` (`username` ignored here) |
| `setUsername(username)` | `PUT /me/username` | `{ username }` → 409 when taken |
| `checkUsername(username)` | `GET /usernames/:username` | → `{ available }` |
| `savePreferences(prefs)` | `PUT /me/preferences` | `Preferences` (interests + home city) |
| `createEvent(draft)` | `POST /events` | `EventDraft` (up to 6 photos) |

Created events are stored per-guest and **projected into the catalog** at read
time (`lib/server/store/draft-event.ts`): they come back from `GET /events`
(newest first) as regular `AygoEvent`s with the creator's saved profile as the
host, resolve by id and by share code, and their `/<code>` page renders
server-side for anyone with the link.
| `fetchRegistrations()` | `GET /me/registrations` | → `{ going, applied, stamps }` |
| `fetchProfile()` | `GET /me/profile` | → `Partial<ProfileEdits>` (+ `username`) |
| `fetchPreferences()` | `GET /me/preferences` | → `Preferences \| null` |
| `fetchMyEvents()` | `GET /me/events` | → `EventDraft[]` (what you host) |

### Inbox, messaging and accounts

| Function | Method & path | Body |
| --- | --- | --- |
| `fetchNotifications()` | `GET /me/notifications` | → `{ items, unread }` (unread counts every row) |
| `markNotificationsRead(ids?)` | `POST /me/notifications/read` | `{ ids? }` (none = all) |
| `sendEventFeedback(id, kind, msg)` | `POST /events/:id/feedback` | `{ kind, message }` → `{ id }` |
| `fetchMyThreads()` | `GET /me/reports` | → `EventReport[]` (your questions/reports + replies) |
| `replyToMyThread(id, msg)` | `POST /me/reports/:id/reply` | `{ message }` |
| `replyToFeedback(eventId, reportId, msg)` | `POST /events/:id/feedback/:reportId/reply` | `{ message }` (host) |
| `linkAccountSession({ accessToken, dpop })` | `POST /me/session` | → `{ changed }`, or 428 `{ nonce }` |
| `endAccountSession()` | `DELETE /me/session` | → `{ changed }` |

### Usernames

Every account has a public handle, picked right after the first sign-in
(`components/onboarding/username-gate.tsx` — a dialog that can't be dismissed
while the server says the session has none) and editable in Settings. Rules
live in `lib/username.ts` (shared, live validation) and
`lib/server/username.ts` (reserved names + content filter); uniqueness is the
`usernames` table's primary key, claimed atomically by `PUT /me/username`.
The handle is never inside the profile JSON.

### Accounts (a login that follows you across devices)

Pollar's access tokens are DPoP-bound, so the server can't use one by itself.
On sign-in the browser builds a DPoP proof for Pollar's own session check
(`GET /v3/auth/session/resume`) with the SDK's per-session key and sends
token + proof to `POST /me/session`; the server relays that exact request
(`lib/server/pollar.ts`), Pollar verifies signature, bound key and claims, and
returns the profile. The **verified** identity (provider id, else email) is
hashed into an account key and mapped to one session id in the `accounts`
table — so the same person on a new device, or after clearing cookies, gets
their events, RSVPs, stamps and inbox back. Nothing the client typed ever
names the account. Sign-out rotates the browser to a fresh anonymous id.

### Databases per environment

One Neon project (`aygo`, id `aged-glade-61821907`), one **branch per
environment** — branches are copy-on-write forks with their own compute, so
dev can't touch production rows:

| Environment | Neon branch | Where `DATABASE_URL` lives |
| --- | --- | --- |
| Production (aygo.app) | `production` (`br-wispy-shape-aiiegkit`) — mark it *protected* in the Neon console | Vercel → Settings → Environment Variables → **Production** only |
| Preview (PR deploys) | `dev` (`br-fragrant-mode-aiqyk6p6`), or a per-PR branch from the Neon↔Vercel integration | Vercel → **Preview** |
| Local development | `dev` | `.env.local` (`AYGO_DB_BRANCH=dev`) |

`lib/server/env.ts` refuses to boot when the labels disagree: production with
`AYGO_DB_BRANCH≠production` or the memory store, and any other environment
with `AYGO_DB_BRANCH=production` (override with `AYGO_ALLOW_PROD_DB=1` on
purpose). The schema is created lazily on first use (`CREATE TABLE IF NOT
EXISTS`), so a fresh branch needs no migration step; to refresh dev with
production data, "reset from parent" the `dev` branch in the Neon console.

### Security model (every write goes through it)

- **Shape & limits** — `lib/server/validate.ts`: every body is parsed into an
  exact shape (extra fields dropped), strings are cleaned (control/invisible
  characters removed) and length-capped, enums are checked against the app's
  own lists (themes, calendars, categories, cities, timezones), ids must be
  UUIDs/slugs. Bodies are capped (`readJson(req, maxBytes)`: 64 KB default,
  10 MB for events with photos) and must be `application/json`.
- **Images** — `lib/server/images.ts`: only JPEG/PNG/WebP data URLs whose
  bytes really start with that format's magic number, with decoded size and
  pixel dimensions capped (read from the header, no decoder); the client
  (`lib/image.ts`) resizes and steps JPEG quality down to stay under the cap.
  Event artwork is an upload or one of `public/covers`; avatar URLs only from
  the login providers. No SVG/GIF/HEIC, no other schemes.
- **Content** — `lib/server/moderation.ts` + `banned-terms.ts`: invisible
  chars, NFKC, Cyrillic/Greek look-alikes, leetspeak, spaced/dotted letters
  and stretched letters are all folded before whole-word matching; plus spam
  rules per field (no links/phones in titles, ≤3 links in bodies, no
  shorteners, no floods, no markup).
- **Rate limits** — `lib/server/rate-limit.ts`: sliding windows per session
  AND per IP on every write (create/edit events, RSVPs, messages, profile,
  session, admin login, geocode). Durable caps in the store: 10 events/day and
  60 total per session, 20 messages/day, 3 open threads per event, no
  duplicate titles per day / repeated messages.
- **Authorization** — owner checks on every host action; new event ids must
  be client-generated UUID v4 (no slug squatting); hosts can't register for,
  request, or message their own event; approvals/removals only for real
  pending requests/guests; stamps only for registered guests once the event
  started; `hostName`/`hostPhone` are admin-only and ignored from clients.
- **Transport** — `proxy.ts` refuses cross-site mutating requests (Origin /
  Sec-Fetch-Site), API responses are `no-store`/`nosniff`; `next.config.ts`
  sets X-Frame-Options, Referrer-Policy, Permissions-Policy, HSTS.

Notifications are emitted server-side by the routes that cause them
(`lib/server/notify.ts`): a registration or join request notifies the host,
a decision notifies the guest, a question/reply notifies the other side, and
a report status change notifies the reporter. `POST /events` validates dates
(no past events), media (≤ 6 photos), price, and runs the content filter
(`lib/server/moderation.ts`) on every free-text field; the same filter guards
questions, replies and join notes. Delivery is in-app only (the bell and
`/inbox`); no email/SMS/push channel exists, and nothing pretends otherwise.

The **hydration** functions (`fetch*`) are called once per page load by
`hooks/use-server-sync.ts` (mounted in the root layout via
`components/layout/server-sync.tsx`). Merge policy: lists (going / applied /
stamps) are **unioned** — server rows are adopted locally and local-only rows
are pushed up as unsynced offline writes; profile and preferences keep the
local copy when one exists (pushing it up if it differs) and adopt the
server's otherwise.

## Local-first model

User-owned state (RSVPs, applications, stamps, profile, preferences) is written to
localStorage **first** and rendered immediately — the UI never blocks on the network.
The matching `api/*` call then syncs the change to the backend in the background.
On load, the `fetch*` functions hydrate the local cache from the server.

Optimistic list writes (going / applied) roll back locally when the server
refuses them; registering and collecting an aygo await the server first, so a
confirmation is never shown for something the server didn't accept.

This is why the app feels instant. Types live in `@/types`; consume everything
through the `@/lib/api` barrel.
