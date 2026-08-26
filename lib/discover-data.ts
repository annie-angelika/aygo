// Discover content, serializable halves only. These arrays are the SEED for
// the backend's `category_pages` and `calendars` tables; the live versions
// (with real, computed event counts) come from `GET /api/categories` and
// `GET /api/calendars` via the discover hooks. Category icons/tints live in
// CATEGORY_META (lib/events-data) — presentation stays client-side.

import { CATEGORIES } from "@/lib/events-data";
import { cityKey } from "@/lib/utils";
import type {
  AygoEvent,
  Category,
  CalendarInfo,
  CategoryStat,
  CityInfo,
} from "@/types";

export type { CalendarInfo as Calendar, CategoryStat } from "@/types";

// --- Real counts -------------------------------------------------------------
// Dress stored city/category rows with counts computed from the live events
// list (created events included). Upcoming-only — that's the number a "what's
// happening" surface sells. Used by both server stores.

export function citiesWithCounts(
  cities: Omit<CityInfo, "eventCount">[],
  events: AygoEvent[],
): CityInfo[] {
  const byCity = new Map<string, number>();
  for (const e of events) {
    if (e.isPast) continue;
    const key = cityKey(e.city);
    byCity.set(key, (byCity.get(key) ?? 0) + 1);
  }
  return cities.map((c) => ({ ...c, eventCount: byCity.get(cityKey(c.name)) ?? 0 }));
}

export function categoriesWithCounts(
  pages: Omit<CategoryStat, "count">[],
  events: AygoEvent[],
): CategoryStat[] {
  const byCategory = new Map<string, number>();
  for (const e of events) {
    if (e.isPast) continue;
    byCategory.set(e.category, (byCategory.get(e.category) ?? 0) + 1);
  }
  // Keep the canonical CATEGORIES order regardless of row order in the store.
  return [...pages]
    .sort(
      (a, b) => CATEGORIES.indexOf(a.category) - CATEGORIES.indexOf(b.category),
    )
    .map((p) => ({ ...p, count: byCategory.get(p.category) ?? 0 }));
}

/**
 * Copy + artwork per interest ("Browse by interest" tiles and the category
 * page). Artwork is aygo's own (public/covers) — no stock-photo service. No
 * counts here — the backend computes them from real events.
 */
export const CATEGORY_PAGES: Omit<CategoryStat, "count">[] = [
  { category: "Music", blurb: "Peñas, gigs, and DJ sets — from charango folk to basement house. The city's sound, every night of the week.", image: "/covers/aygo-night.png" },
  { category: "Food", blurb: "Salteña crawls, market tastings, and supper clubs. A new flavor to chase around the city each week.", image: "/covers/aygo-gold.png" },
  { category: "Culture", blurb: "Fairs, gallery openings, and workshops from local artists and makers. Meet the people behind the scene.", image: "/covers/aygo-paper.png" },
  { category: "Outdoors", blurb: "Hikes, summits, and bike descents across the highest trails in the Andes. Fresh air at altitude.", image: "/covers/aygo-dawn.png" },
  { category: "Party", blurb: "Cumbia, house, and rooftop afters. Find your next night out and the crew to share it with.", image: "/covers/aygo-cream-night.png" },
  { category: "Sports", blurb: "Pickup games, downhill rides, and weekend leagues for every level. Show up and play.", image: "/covers/aygo-stripe.png" },
];

export function findCategoryPage(
  category: Category,
): Omit<CategoryStat, "count"> | undefined {
  return CATEGORY_PAGES.find((c) => c.category === category);
}

/**
 * Featured community calendars are REAL content, curated by the admin
 * (Admin → Calendars) and stored in the backend's `calendars` table. Nothing is
 * seeded here on purpose: a fresh install shows no calendars until an operator
 * adds one, and Discover hides the section while the list is empty.
 */
export const FEATURED_CALENDARS: CalendarInfo[] = [];
