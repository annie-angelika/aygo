# aygo

Events in Bolivia, gamified: discover → register in one tap → pay the host over
WhatsApp (they confirm by hand) → show up → scan the QR at the door → collect the
event's **aygo** in your passport → share.

Next.js 16 (App Router) · React 19 · Tailwind v4 · Neon Postgres · Pollar login.

## Run it

```bash
pnpm install
cp .env.example .env.local   # fill in the values (see the comments in the file)
pnpm dev
```

- `AYGO_DATA_SOURCE=memory` runs with an in-process store (resets on restart) —
  zero setup for local UI work.
- `AYGO_DATA_SOURCE=postgres` + `DATABASE_URL` uses Neon; the schema is created
  lazily on first use. `POST /api/admin/seed` (with `x-admin-token`) seeds the
  discover content. **No demo events or people are ever seeded.**
- Login needs `NEXT_PUBLIC_POLLAR_PUBLISHABLE_KEY`; without it the app browses
  but can't sign in.

## Where things live

| | |
| --- | --- |
| `app/` | routes — `(app)/*` app chrome, `[slug]` the flat Luma-style namespace (city / interest / calendar / event by share code), `api/*` the backend |
| `components/` | UI, by domain (`event`, `create`, `manage`, `passport`, `discover`, …) |
| `hooks/` | client data hooks (`use-registrations`, `use-me`, `use-account-session`, …) |
| `lib/api/` | the only client → backend seam; contract in [`lib/api/README.md`](lib/api/README.md) |
| `lib/server/` | route helpers, validation, moderation, sessions, Pollar verification, the store (`memory` / `postgres`) |

## What's real and what isn't

Everything in the product loop is real and server-enforced: catalog, creation,
registrations and approvals, capacity, host tools, questions/reports and their
threads, in-app notifications, QR check-in and aygos, admin dashboard, accounts
that follow you across devices, mandatory unique usernames with public
profiles at `/u/<username>`.

Deliberately **not** built (and not pretended): in-app payments (guests pay the
host directly via WhatsApp or the host's link; the host confirms by hand),
email/SMS/push notifications (in-app only).
