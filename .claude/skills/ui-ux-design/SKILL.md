---
name: ui-ux-design
description: >-
  UI/UX design system and craft guide for the aygo mobile app (Next.js 16 +
  React 19 + Tailwind v4). Use whenever building, refactoring, or reviewing any
  visual component, screen, card, layout, microcopy, empty/loading/error state,
  spacing, color, typography, motion, accessibility, or responsive behavior.
  Encodes the project's real design tokens and patterns so new UI matches the
  existing look and feel instead of generic defaults.
---

# aygo — UI/UX Design System

aygo is a **mobile-first events app** for Bolivia (discover an event → say
you're going → coordinate over WhatsApp → collect a passport stamp). UI text is
in **español** (rioplatense/boliviano voice: cálido, cercano, "vos"). Every
screen lives inside a phone-width shell. Craft bar is high.

> **STACK (authoritative — overrides the legacy token tables below):**
> - **Components: shadcn/ui (Base UI primitives).** Do NOT hand-roll Card,
>   Button, Tabs, Select, Avatar, Badge, Progress, Skeleton, Separator, etc. —
>   use the ones in `components/ui/`, add more with `npx shadcn@latest add`.
>   Base UI Button/Select take `render={<X/>}`, **not** `asChild`.
> - **Icons: react-icons (`react-icons/lu`).** **NO emojis** in UI.
> - **No motion library** (no framer-motion). CSS transitions only.
> - **Color: theme tokens**, not ad-hoc palette classes. `bg-background` (warm
>   sand), `bg-card`, `text-foreground`, `text-muted-foreground`, `border-border`,
>   `ring-ring`. Warm accent = amber/orange; category tints live in
>   `CATEGORY_META` (`lib/events-data.ts`). Tokens are defined in `app/globals.css`.
> - **Reference layout = Luma**: clean, date-grouped timelines, Upcoming/Past
>   tabs, a single interest filter. See `components/event/` + `components/screens/`.
>
> The pixel type-scale and composition habits below still apply; where the old
> color guidance says `ring-white`/`bg-white/80`/emoji, prefer the token + shadcn
> + react-icons equivalents above.

---

## 1. Design tokens (use these exact values)

### Color
Two surfaces. **Light** = warm sand. **Dark** = deep violet (only the home
backdrop and elements layered over it use `tone="dark"`).

- **Background (light):** `#f6f4ef` (`bg-background`). Foreground `#0f172a`.
- **Surface / card:** `bg-white/80` or `bg-white/95` + `ring-1 ring-white` +
  `backdrop-blur`. Cards float on the sand — translucency + ring, not hard borders.
- **Brand accent (light):** **amber** — `text-amber-600` eyebrows, `bg-amber-50`
  / `ring-amber-200` chips, `hover:bg-amber-50` rows, `text-amber-400` stars.
- **Brand accent (dark):** **violet / fuchsia** — `text-fuchsia-300/90` eyebrows,
  `text-violet-200/90` actions, `ring-violet-400/60` focus.
- **Primary action:** near-black pill — `bg-slate-900` `text-white`
  `hover:bg-slate-800`. (See `PrimaryCta`.)
- **Text:** `text-slate-900` (primary), `text-slate-700` (body), `text-slate-500`
  (muted/meta), `text-slate-400` (faint). On dark: `text-white`,
  `text-violet-200/40` placeholders.
- **Semantic chips:** ratings/positive `bg-emerald-100 text-emerald-700`;
  highlight/vibe `bg-amber-200 text-slate-900`; neutral `bg-slate-100 text-slate-700`.

Never introduce a new hue without reason. Stay within amber/violet/slate/emerald.

### Typography
This app uses **explicit pixel sizes in brackets**, not Tailwind's `text-sm`/`text-base`.
Match the scale:

- Screen/section title: `text-[16px] font-semibold tracking-tight`
- Card title: `text-[13px]`–`text-[13.5px] font-semibold`
- Body: `text-[12px]`–`text-[12.5px]`
- Meta / secondary: `text-[11px]`–`text-[11.5px] text-slate-500`
- Eyebrow / label: `text-[10.5px] font-semibold uppercase tracking-wider`
- Big stat: `text-[20px] font-semibold`

Weights are `font-semibold` for almost everything; reserve regular for body prose.
Use `tracking-tight` on titles, `tracking-wider` on uppercase eyebrows.

### Radius, shadow, ring
- Radii: pills `rounded-full`, cards `rounded-2xl`, inner items `rounded-xl`,
  thumbnails `rounded-lg`. Bigger surface → bigger radius.
- Shadows are **soft, colored, directional**, not gray boxes:
  `shadow-[0_18px_40px_-18px_rgba(15,23,42,0.35)]` (dropdowns),
  `shadow-[0_12px_24px_-12px_rgba(15,23,42,0.5)]` (CTA).
- Use `ring-1` for separation far more than `border`. `ring-white` on light cards,
  `ring-slate-200` on inputs, `ring-amber-200`/`ring-violet-400/60` for accents.
- `backdrop-blur` on any floating/translucent surface.

### Spacing & layout
- Tight, deliberate gaps: `gap-1.5`, `gap-2`, `gap-3`. Card padding `p-2`/`p-3`.
- Phone shell width — content is column-first; rely on the app/layout container,
  don't add page-level max-widths inside components.
- Touch targets ≥ ~36px (`size-9`/`size-10` for icon buttons).

---

## 2. Component conventions (how this codebase is built)

- **`cn(...)` from `@/lib/utils`** composes classes. It does NOT dedupe Tailwind —
  funnel all overrides through a single trailing `className` prop, applied last.
- **`tone="light" | "dark"`** is the established prop for surface-aware components
  (`SearchBar`, `Section`). Branch with `const dark = tone === "dark"` and pick
  class sets via `cn`. Add this prop when a component can appear over the home backdrop.
- **`"use client"`** only on components with state/handlers/router. Keep
  presentational primitives server-friendly (see `components/ui/primitives.tsx`).
- **Icons** come from `@/components/ui/icons` (inline SVG, `currentColor`,
  `stroke-width=2`, `aria-hidden`). `react-icons` is available for gaps. Never
  paste raw SVG into a screen.
- **Reuse primitives first:** `Section`, `Stat`, `ProfileRow`, `Stars`, `ReviewRow`,
  `BackButton`, `PrimaryCta`, `SearchBar`, filter pills, segmented toggle, skeleton.
  Build a new primitive in `components/ui/` only when a pattern repeats ≥3×.
- **Images:** plain `<img>` with the `// eslint-disable-next-line @next/next/no-img-element`
  comment (the project's deliberate choice), `object-cover`, decorative ones get `alt=""`.

---

## 3. UX rules (non-negotiable)

1. **Every async surface has three states.** Loading (skeleton or "Buscando…"),
   empty (helpful, suggests next action — see `SearchBar`'s EmptyState with quick
   suggestions), and error/no-match (specific, suggests alternatives, never a dead end).
2. **Microcopy is warm and concrete, in español.** "Sin coincidencias para "X". Probá
   con…" beats "No results". Use real example terms. Voseo ("Probá", "vos").
3. **Accessibility:** every icon-only button has `aria-label` (`Volver`, `Limpiar`,
   `Más`). Decorative icons/images get `aria-hidden`/`alt=""`. Visible focus via
   `focus-within:ring-*`. Honor keyboard: Escape clears, Enter picks first result.
4. **Feedback on interaction:** `hover:` color shifts, `transition-colors`. Active/
   selected states are explicit (filled vs outline). Use `onMouseDown preventDefault`
   when a click inside a dropdown must register before blur closes it.
5. **Truncate, don't wrap unpredictably:** `min-w-0 flex-1` + `truncate` on flex
   text rows (titles, meta). Prevents layout blowups from long names.
6. **Respect the thumb:** primary actions reachable, generous tap targets, sticky
   bottom CTAs where it's the main action.
7. **Motion is subtle.** Color/opacity transitions, gentle reveals. No bouncy or
   long animations — this is a calm, premium feel.

---

## 4. Workflow when building/changing UI

1. **Locate the pattern.** Find the closest existing component/screen and read it.
2. **Reuse or extend** a primitive before inventing markup.
3. **Apply tokens** from §1 exactly — bracket pixel sizes, the right ring/shadow,
   amber(light)/violet(dark) accents.
4. **Cover all states** (§3.1) and write español microcopy (§3.2).
5. **Pass the accessibility checklist** (§3.3).
6. **Verify visually** — run `npm run dev` and check the actual screen at phone
   width, both light and (where relevant) the dark home backdrop. Don't assume.

### Pre-ship checklist
- [ ] Matches a sibling component's structure & spacing
- [ ] Tokens: bracket type sizes, `rounded-2xl/xl`, `ring`+`backdrop-blur`, soft shadow
- [ ] Correct accent for surface (amber light / violet dark), `tone` prop if needed
- [ ] Loading + empty + error states all handled
- [ ] Microcopy in warm español (voseo), concrete suggestions
- [ ] `aria-label` on icon buttons, `alt`/`aria-hidden` on images/icons
- [ ] `hover`/focus/active feedback with `transition-colors`
- [ ] `min-w-0`+`truncate` on flex text; no overflow at narrow width
- [ ] Overrides funneled through trailing `className` via `cn`
- [ ] Looks right in the running app, not just in code
