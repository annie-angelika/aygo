// Discover content, serializable halves only. These arrays are the SEED for
// the backend's `category_pages` and `calendars` tables; the live versions
// (with real, computed event counts) come from `GET /api/categories` and
// `GET /api/calendars` via the discover hooks. Category icons/tints live in
// CATEGORY_META (lib/events-data) — presentation stays client-side.

import { CATEGORIES } from "@/lib/events-data";
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
// happening" surface sells. Shared by the server stores and the mock api path.

export function citiesWithCounts(
  cities: Omit<CityInfo, "eventCount">[],
  events: AygoEvent[],
): CityInfo[] {
  const byCity = new Map<string, number>();
  for (const e of events) {
    if (e.isPast) continue;
    byCity.set(e.city, (byCity.get(e.city) ?? 0) + 1);
  }
  return cities.map((c) => ({ ...c, eventCount: byCity.get(c.name) ?? 0 }));
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

const pic = (seed: string, w = 480, h = 360) =>
  `https://picsum.photos/seed/${seed}/${w}/${h}`;

/**
 * Copy + artwork per interest ("Browse by interest" tiles and the category
 * page). No counts here — the backend computes them from real events.
 */
export const CATEGORY_PAGES: Omit<CategoryStat, "count">[] = [
  { category: "Music", blurb: "Peñas, gigs, and DJ sets — from charango folk to basement house. The city's sound, every night of the week.", image: pic("jazz-night") },
  { category: "Food", blurb: "Salteña crawls, market tastings, and supper clubs. A new flavor to chase around La Paz each week.", image: pic("saltena-morning") },
  { category: "Culture", blurb: "Fairs, gallery openings, and workshops from local artists and makers. Meet the people behind the scene.", image: pic("feria-diseno") },
  { category: "Outdoors", blurb: "Hikes, summits, and bike descents across the highest trails in the Andes. Fresh air at altitude.", image: pic("killikilli-sunset") },
  { category: "Party", blurb: "Cumbia, house, and rooftop afters. Find your next night out and the crew to share it with.", image: pic("after-prado") },
  { category: "Sports", blurb: "Pickup games, downhill rides, and weekend leagues for every level. Show up and play.", image: pic("downhill-bici") },
];

export function findCategoryPage(
  category: Category,
): Omit<CategoryStat, "count"> | undefined {
  return CATEGORY_PAGES.find((c) => c.category === category);
}

/**
 * Featured community calendars — curated collections of events. `category`
 * scopes each calendar's events board to its interest.
 */
export const FEATURED_CALENDARS: CalendarInfo[] = [
  {
    id: "andes-outdoors",
    name: "Andes Outdoors",
    logo: pic("cal-andes", 120, 120),
    cover: pic("muela-diablo"),
    location: "La Paz",
    featured: "Featured calendar",
    category: "Outdoors",
    description:
      "Hikes, summits, and bike descents across the Bolivian Andes. We meet weekly and welcome every level — bring water and a warm layer for the altitude.",
  },
  {
    id: "pacena-nights",
    name: "Paceña Nightlife",
    logo: pic("cal-nights", 120, 120),
    cover: pic("after-prado"),
    location: "La Paz",
    category: "Party",
    description:
      "Cumbia, house, and afters around the city. Find your next night out and the crew to share it with.",
  },
  {
    id: "cultura-viva",
    name: "Cultura Viva",
    logo: pic("cal-cultura", 120, 120),
    cover: pic("pena-folk"),
    location: "La Paz",
    featured: "Featured calendar",
    category: "Culture",
    description:
      "Fairs, workshops, and gallery openings from local artists and makers. Meet the people behind the scene.",
  },
  {
    id: "mercados-food",
    name: "Mercados & Food",
    logo: pic("cal-food", 120, 120),
    cover: pic("ceramica-taller"),
    location: "La Paz",
    category: "Food",
    description:
      "Street-food crawls and market tastings, a new spot every week. Come hungry.",
  },
];

/** Static resolution over the seed (slug routing + instant hero identity). */
export function findCalendar(id: string): CalendarInfo | undefined {
  return FEATURED_CALENDARS.find((c) => c.id === id);
}
