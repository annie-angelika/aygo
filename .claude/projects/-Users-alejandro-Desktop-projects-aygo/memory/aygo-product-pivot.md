---
name: aygo-product-pivot
description: aygo is pivoting from a travel/destinations app to a gamified events app (feed-first, passport gamification, WhatsApp contact)
metadata:
  type: project
---

As of 2026-06-21, aygo is being reframed from a Bolivia travel app (destinations/guides/journal) into a **gamified events app** — MVP aimed at market launch.

Core loop (North Star): **abrir → ver evento interesante → inscribirse en 1 tap → contactar por WhatsApp → ir → coleccionar sello → compartir.**

Decisions locked with the user (UX-first, before visual design or backend):
- **Navigation:** 3 tabs only — `Explorar` (feed) · `Mis eventos` · `Pasaporte` (perfil+juego). Cut the old destinos/guías/journal + 3-category search.
- **Discovery primitive:** vertical **feed de cards** with quick time filter `Hoy · Este finde · Próximos`. Map is a secondary view (v2), calendar rejected as too rigid.
- **Friction:** deferred login — only ask name + phone at the moment of registering (powers the WhatsApp handoff). Inspired by Partiful's zero-friction RSVP.
- **Contact:** WhatsApp (pre-filled message to organizer) — current mechanism.
- **Gamification (max 3 mechanics):** "Pasaporte de experiencias" — sellos (1 per attended event) + niveles de explorador + compartir. NO leaderboards, NO badge overload (research: >3 badges drives ~40% churn).
- **Visual personality direction:** cultural / warm "passport" — editorial, photo-led, warm tones (not bold-playful, not minimal-premium).

**Why:** user emphasized the product must look simple, modern, with personality, and ship-ready; current UI has too much "bulla" (noise).
**How to apply:** keep every feature serving the 6-step happy path; always cover empty/no-event/no-stamp states; sharing is the growth motor and must always be available. Design tokens & component conventions live in [[ui-ux-design]] skill; component structure rules in [[component-architecture]] skill (both in .claude/skills/).

**IMPLEMENTED (2026-06-21), full frontend prototype:** Routes are `/descubre` (feed, default), `/mis-eventos` (Próximos/Ya fui), `/pasaporte` (level + stamps), `/evento/[id]` (full-screen detail, outside tab group). Old travel app (home/vibes/plan/journal/profile/place + destinations/guides) fully deleted. Data is mock in `lib/events-data.ts`; RSVP + stamps persist in localStorage via `hooks/use-registrations.ts` (keys `aygo.going`, `aygo.stamps`). Domain type is `AygoEvent` (not `Event`). Feature components in `components/event/` + `components/passport/`. Backend still TODO (api functions return mock).

**DESIGN SYSTEM (2026-06-21):** Adopted **shadcn/ui** (CLI v4, **Base UI** primitives — note: Base UI Button/Select use `render={<X/>}` NOT `asChild`; no framer-motion, CSS animations only). Do NOT hand-roll components that shadcn provides. Icons are **react-icons (`react-icons/lu` = lucide)** — **no emojis anywhere**. Theme is a **warm light** "cultural" palette via shadcn tokens in `app/globals.css` (`bg-background` sand, `bg-card`, `text-muted-foreground`, amber accents); use tokens, not ad-hoc slate/white. The `/descubre` screen follows the **Luma** layout: Upcoming/Past `Tabs` + a single interest `Select` + events grouped by date with a timeline rail (`DateGroup` + `EventRow`). Event ids must be ASCII (renamed `peña-marka`→`pena-marka`).

**NAVIGATION (2026-06-21): no bottom tab bar.** All nav lives in a sticky top app bar `components/layout/top-bar.tsx` (Luma-style): `aygo.` wordmark → `/descubre`, ticket icon → `/mis-eventos`, profile **avatar photo** → `/pasaporte` (the avatar carries a small amber level badge = gamification hint). `CURRENT_USER` (mock profile + avatar) lives in `lib/events-data.ts`. The passport screen doubles as the profile (avatar + name header). Screen horizontal margins are `px-4` (16px) to match Luma.
