// Presentation metadata for the events domain: interests (categories) with
// their icons, explorer levels, and the short share code. The catalog itself
// lives in the backend (`app/api/events`) — nothing here is data.

import type { IconType } from "react-icons";
import {
  LuPartyPopper,
  LuMusic,
  LuPalette,
  LuUtensils,
  LuMountain,
  LuDumbbell,
} from "react-icons/lu";
import type { Category, Level } from "@/types";

/**
 * Per-category presentation. Class strings are literal so Tailwind keeps them.
 * `Icon` is a react-icons component (no emojis anywhere in the UI).
 */
export const CATEGORY_META: Record<
  Category,
  { Icon: IconType; chip: string; soft: string; accent: string }
> = {
  // One palette for every interest — navy on navy-soft, gold when active. What
  // tells them apart is the icon plus its label, never a colour.
  Party: { Icon: LuPartyPopper, chip: "bg-primary text-primary-foreground", soft: "bg-secondary", accent: "text-foreground" },
  Music: { Icon: LuMusic, chip: "bg-primary text-primary-foreground", soft: "bg-secondary", accent: "text-foreground" },
  Culture: { Icon: LuPalette, chip: "bg-primary text-primary-foreground", soft: "bg-secondary", accent: "text-foreground" },
  Food: { Icon: LuUtensils, chip: "bg-primary text-primary-foreground", soft: "bg-secondary", accent: "text-foreground" },
  Outdoors: { Icon: LuMountain, chip: "bg-primary text-primary-foreground", soft: "bg-secondary", accent: "text-foreground" },
  Sports: { Icon: LuDumbbell, chip: "bg-primary text-primary-foreground", soft: "bg-secondary", accent: "text-foreground" },
};

/** Ordered list of interests for the single discover filter. */
export const CATEGORIES: Category[] = [
  "Party",
  "Music",
  "Culture",
  "Food",
  "Outdoors",
  "Sports",
];

/** URL slug for a category page (/<slug>). */
export const categorySlug = (c: Category) => c.toLowerCase();

/** Resolve a category from a URL slug (case-insensitive). */
export function findCategory(slug: string): Category | undefined {
  return CATEGORIES.find((c) => c.toLowerCase() === slug.toLowerCase());
}

/** Explorer tiers. Reached when stamp count ≥ `min`. */
export const LEVELS: Level[] = [
  { index: 1, name: "Curious", min: 0 },
  { index: 2, name: "Explorer", min: 3 },
  { index: 3, name: "Adventurer", min: 7 },
  { index: 4, name: "Legend", min: 14 },
];

/**
 * Short, shareable code for an event's URL — /<code>, Luma-style (e.g. /q0gdufts).
 * Derived deterministically from the id (base36 hash) so links stay short and
 * stable without storing a separate column.
 */
export function eventCode(id: string): string {
  const SPACE = 36 ** 8; // eight base36 chars
  let h = 0;
  for (let i = 0; i < id.length; i++) {
    h = (h * 131 + id.charCodeAt(i)) % SPACE;
  }
  return h.toString(36).padStart(8, "0");
}
