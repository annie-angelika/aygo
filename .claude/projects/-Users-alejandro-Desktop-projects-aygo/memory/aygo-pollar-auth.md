---
name: aygo-pollar-auth
description: aygo's social login + browse-without-login gating is built on Pollar (@pollar/react); useAuth() is the single auth source
metadata:
  type: project
---

As of 2026-06-23, aygo's social login is implemented with **Pollar** (`@pollar/react` + `@pollar/core`, v0.9.0). This realizes the "deferred login" decision from [[aygo-product-pivot]]: browse freely, sign in only when an action needs an identity (Luma-style).

Architecture:
- **Provider:** `components/auth/pollar-provider.tsx` wraps the whole app in root `app/layout.tsx`. Uses `<PollarProvider client={{ apiKey, stellarNetwork }}>` — note the prop is `client`, **not** `publishableKey`/`config` (the published docs are wrong; trust the installed `.d.ts`). Reads `NEXT_PUBLIC_POLLAR_PUBLISHABLE_KEY` + `NEXT_PUBLIC_POLLAR_NETWORK` (empty key = app still browses, login inert). Imports `@pollar/react/styles.css`.
- **Single source of truth:** `hooks/use-auth.ts` (`useAuth()`) wraps `usePollar()` → `{ isAuthenticated, name, email, avatar, profile, login, logout, openLoginModal }`. Profile (name/email/avatar) comes from `getClient().getUserProfile()` (`PollarUserProfile`: `mail`, `first_name`, `last_name`, `avatar`) — held in memory only, so it's seeded via a lazy `useState` and kept fresh via `client.onAuthStateChange` (never call setState in an effect body — lint rule `react-hooks/set-state-in-effect`).
- **Gating components:** `components/auth/sign-in-button.tsx` (calls `openLoginModal()`), `components/auth/auth-gate.tsx` (route guard: renders children when authed, else a "sign in" prompt; `tone="dark"` for the create canvas).

What's gated when signed out:
- Navbar (`components/layout/top-bar.tsx`): only Discover + a Sign In pill; Create/your-events/profile-menu hidden; logo → `/discover` instead of `/home`.
- Routes: `/home` (your tickets) and `/create` wrapped in `<AuthGate>`.
- Actions: `FollowButton` and event registration (`EventActions`) open the login modal instead of acting.
- Register sheet (`RegisterDialog`) prefills the applicant from the Pollar profile (it only opens once authed).

**Important:** identity is still overlaid on the mock `CURRENT_USER` ("you") in `lib/events-data.ts` / `lib/users-data.ts` — Pollar only drives the auth gate + display name/email/avatar; the rest of the profile/data is still mock. `ProfileMenu` Sign Out calls `useAuth().logout()` then routes to `/discover`.

**How to apply:** gate any new identity-requiring action via `useAuth()` (`isAuthenticated` + `openLoginModal`), not by reading Pollar directly. The `[PollarClient] constructor() called server-side` build/prerender warnings are benign and unavoidable (provider must render during SSR so `usePollar()` exists).
