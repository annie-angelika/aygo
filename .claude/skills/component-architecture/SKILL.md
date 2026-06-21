---
name: component-architecture
description: >-
  Rules for structuring React/Next components in aygo so they stay small,
  generic, and composable — no duplicate components doing the same job, no long
  files. Use whenever creating, splitting, or refactoring components, deciding
  where a piece of UI lives, or reviewing component structure. Complements the
  ui-ux-design skill (which owns visual tokens); this one owns structure.
---

# aygo — Component Architecture

Goal: a small set of **generic base components** that get **composed** into
feature components and screens. Design comes later and should be easy *because*
the structure is clean. Pairs with [[ui-ux-design]] (visual tokens).

## Layering (where things live)

```
components/ui/        Base — mostly shadcn/ui (Base UI primitives): Card,
                      Button, Tabs, Select, Avatar, Badge, Progress, Skeleton,
                      Separator + a few thin app wrappers (AvatarStack,
                      EmptyState, ScreenHeader). Generic, no domain types.
components/<feature>/  Feature — composes base + knows ONE domain type.
                      e.g. event/EventCard, passport/StampGrid.
components/screens/   Screen — composes feature components into a page body.
                      Owns layout + data hooks, almost no raw markup.
app/.../page.tsx      Route — thin. Fetches/awaits params, renders a screen.
```

Rule of thumb: **markup flows down, data flows down, nothing reaches up.**

## Hard rules

1. **No duplicates; don't hand-roll what exists.** Before writing a component,
   check (a) shadcn/ui — `npx shadcn@latest add <name>` — and (b) `components/`
   for one already in the repo. Never re-implement a Card/Button/Tabs/Select/
   Badge/Avatar/Progress/Skeleton from scratch. If two components differ only by
   data, they're one component with props. Icons come from `react-icons/lu`
   (no emojis); no motion library.
2. **Keep files short.** Target < ~60 lines per component, hard ceiling ~120.
   Over that, extract a sub-component or move logic to a hook. A screen that
   reads as a long wall of JSX means feature components are missing.
3. **Base components are generic.** No domain types (`AygoEvent`, `Stamp`) in
   `components/ui/*`. They take primitives (`src`, `label`, `tone`, `children`).
   Generic over `T extends string` when they emit a typed value (see
   `FilterPills`, `SegmentedToggle`).
4. **One responsibility.** A component either *presents* or *orchestrates*, not
   both. Push state/effects/storage into hooks (`hooks/use-*`); keep the
   component a function of its props where possible.
5. **Client boundary as low as possible.** Mark `"use client"` only on the
   smallest island that needs state/handlers (e.g. `GoingButton`,
   `EventActions`), not the whole screen or detail. Server components stay the
   default; pass data down as props.
6. **Compose, don't configure.** Prefer `children` and small slots
   (`trailing`, `action`) over a pile of boolean flags. Variants that change
   *meaning* → separate components; variants that change *look* → a `tone`/
   `variant`/`size` prop backed by a static class map (Tailwind needs literal
   class strings — never build `bg-${x}-100` dynamically).
7. **Overrides via a trailing `className`**, merged last with `cn()` (which does
   not dedupe — keep callers from passing conflicting utilities).

## Before you ship a component
- [ ] Searched for an existing one; reused or extended instead of duplicating
- [ ] Under the line ceiling; no wall-of-JSX screens
- [ ] Base = generic (no domain types); feature = one domain type; screen = composition
- [ ] `"use client"` only on the smallest island that needs it
- [ ] Variants are static class maps; overrides funnel through `className`
- [ ] State/storage/effects live in a `hooks/use-*`, not inline
