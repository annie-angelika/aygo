// Mock content for the Discover landing (/discover): category browse tiles and
// featured community calendars. Counts are illustrative — data lands later.
// Images reuse the event photo seeds so categories show relevant scenes.

import type { Category } from "@/types";

const pic = (seed: string, w = 480, h = 360) =>
  `https://picsum.photos/seed/${seed}/${w}/${h}`;

/**
 * "Browse by interest" tiles. The card renders the logo + count; the dedicated
 * category page (/<slug>) also uses `subscribers` and `blurb`.
 * `image` is kept for the backend's category_browse table.
 */
export type CategoryBrowse = {
  category: Category;
  count: string;
  /** Follower count + blurb power the category page; absent on the DB path. */
  subscribers?: string;
  blurb?: string;
  image: string;
};

export const CATEGORY_BROWSE: CategoryBrowse[] = [
  { category: "Music", count: "1.2K", subscribers: "8.4K", blurb: "Peñas, gigs, and DJ sets — from charango folk to basement house. The city's sound, every night of the week.", image: pic("jazz-night") },
  { category: "Food", count: "381", subscribers: "3.1K", blurb: "Salteña crawls, market tastings, and supper clubs. A new flavor to chase around La Paz each week.", image: pic("saltena-morning") },
  { category: "Culture", count: "2K", subscribers: "12K", blurb: "Fairs, gallery openings, and workshops from local artists and makers. Meet the people behind the scene.", image: pic("feria-diseno") },
  { category: "Outdoors", count: "640", subscribers: "5.7K", blurb: "Hikes, summits, and bike descents across the highest trails in the Andes. Fresh air at altitude.", image: pic("killikilli-sunset") },
  { category: "Party", count: "1.5K", subscribers: "9.2K", blurb: "Cumbia, house, and rooftop afters. Find your next night out and the crew to share it with.", image: pic("after-prado") },
  { category: "Sports", count: "920", subscribers: "4.3K", blurb: "Pickup games, downhill rides, and weekend leagues for every level. Show up and play.", image: pic("downhill-bici") },
];

export function findCategoryBrowse(category: Category): CategoryBrowse | undefined {
  return CATEGORY_BROWSE.find((c) => c.category === category);
}

export type Calendar = {
  id: string;
  name: string;
  logo: string;
  cover: string;
  description: string;
  location?: string;
  /** Headline follower count shown on the calendar page; absent on the DB path. */
  subscribers?: string;
  /** Optional highlight badge on the calendar header (e.g. "Featured"). */
  featured?: string;
};

/** Featured community calendars — curated collections of events. */
export const FEATURED_CALENDARS: Calendar[] = [
  {
    id: "andes-outdoors",
    name: "Andes Outdoors",
    logo: pic("cal-andes", 120, 120),
    cover: pic("muela-diablo"),
    location: "La Paz",
    subscribers: "6.1K",
    featured: "Featured calendar",
    description:
      "Hikes, summits, and bike descents across the Bolivian Andes. We meet weekly and welcome every level — bring water and a warm layer for the altitude.",
  },
  {
    id: "pacena-nights",
    name: "Paceña Nightlife",
    logo: pic("cal-nights", 120, 120),
    cover: pic("after-prado"),
    location: "La Paz",
    subscribers: "9.8K",
    description:
      "Cumbia, house, and afters around the city. Find your next night out and the crew to share it with.",
  },
  {
    id: "cultura-viva",
    name: "Cultura Viva",
    logo: pic("cal-cultura", 120, 120),
    cover: pic("pena-folk"),
    location: "La Paz",
    subscribers: "4.4K",
    featured: "Featured calendar",
    description:
      "Fairs, workshops, and gallery openings from local artists and makers. Meet the people behind the scene.",
  },
  {
    id: "mercados-food",
    name: "Mercados & Food",
    logo: pic("cal-food", 120, 120),
    cover: pic("ceramica-taller"),
    location: "La Paz",
    subscribers: "2.7K",
    description:
      "Street-food crawls and market tastings, a new spot every week. Come hungry.",
  },
];

export function findCalendar(id: string): Calendar | undefined {
  return FEATURED_CALENDARS.find((c) => c.id === id);
}
