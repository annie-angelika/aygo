// Mock data + presentation metadata for the events domain. All Bolivian.
// Photos use Picsum so we don't need to register a Next.js image domain.
//
// Demo reference "today" is 2026-06-21; day labels are precomputed so grouping
// is deterministic without runtime date math.

import type { IconType } from "react-icons";
import {
  LuPartyPopper,
  LuMusic,
  LuPalette,
  LuUtensils,
  LuMountain,
  LuActivity,
} from "react-icons/lu";
import type { AygoEvent, Category, Level } from "@/types";

const pic = (seed: string, w = 800, h = 600) =>
  `https://picsum.photos/seed/${seed}/${w}/${h}`;
const face = (seed: string) => pic(seed, 96, 96);

/**
 * Per-category presentation. Class strings are literal so Tailwind keeps them.
 * `Icon` is a react-icons component (no emojis anywhere in the UI).
 */
export const CATEGORY_META: Record<
  Category,
  { Icon: IconType; chip: string; soft: string; accent: string }
> = {
  Party: { Icon: LuPartyPopper, chip: "bg-amber-100 text-amber-800", soft: "bg-amber-50", accent: "text-amber-600" },
  Music: { Icon: LuMusic, chip: "bg-violet-100 text-violet-800", soft: "bg-violet-50", accent: "text-violet-600" },
  Culture: { Icon: LuPalette, chip: "bg-rose-100 text-rose-800", soft: "bg-rose-50", accent: "text-rose-600" },
  Food: { Icon: LuUtensils, chip: "bg-orange-100 text-orange-800", soft: "bg-orange-50", accent: "text-orange-600" },
  Outdoors: { Icon: LuMountain, chip: "bg-emerald-100 text-emerald-800", soft: "bg-emerald-50", accent: "text-emerald-600" },
  Sports: { Icon: LuActivity, chip: "bg-sky-100 text-sky-800", soft: "bg-sky-50", accent: "text-sky-600" },
};

/** The signed-in user (mock) — drives the profile avatar in the top bar. */
export const CURRENT_USER = {
  name: "You",
  username: "you",
  avatar: face("me-aygo-user"),
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

/** URL slug for a category page (/discover/category/<slug>). */
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

export const events: AygoEvent[] = [
  {
    id: "salteneada",
    title: "Neighborhood Salteña Brunch",
    category: "Food",
    cover: pic("saltena-morning"),
    startsAt: "2026-06-21T10:30:00",
    dayKey: "2026-06-21",
    dayLabel: "Today",
    weekday: "Sunday",
    timeLabel: "10:30",
    isPast: false,
    place: "Mercado Lanza",
    city: "La Paz",
    host: { name: "Rosa", avatar: face("host-rosa"), phone: "+59171527005" },
    attendees: 18,
    attendeeAvatars: [face("a1"), face("a2"), face("a3"), face("a4")],
    price: null,
    blurb:
      "Start the day with the best salteñas in the area. We're coming as a group and there's room for more. Chat, juice, and a short walk after.",
  },
  {
    id: "sunset-killi",
    title: "Sunset at Killi Killi",
    category: "Outdoors",
    cover: pic("killikilli-sunset"),
    startsAt: "2026-06-21T18:00:00",
    dayKey: "2026-06-21",
    dayLabel: "Today",
    weekday: "Sunday",
    timeLabel: "18:00",
    isPast: false,
    place: "Killi Killi Lookout",
    city: "La Paz",
    host: { name: "Marco", avatar: face("host-marco"), phone: "+59170000001" },
    attendees: 32,
    attendeeAvatars: [face("b1"), face("b2"), face("b3")],
    price: null,
    blurb:
      "The best view of the city as the lights come on. Bring something to share. No rush, good vibes.",
  },
  {
    id: "after-prado",
    title: "El Prado Afterparty",
    category: "Party",
    cover: pic("after-prado"),
    startsAt: "2026-06-26T23:00:00",
    dayKey: "2026-06-26",
    dayLabel: "Fri, Jun 26",
    weekday: "Friday",
    timeLabel: "23:00",
    isPast: false,
    place: "Av. 16 de Julio",
    city: "La Paz",
    host: { name: "Beto", avatar: face("host-beto"), phone: "+59170000005" },
    attendees: 88,
    attendeeAvatars: [face("f1"), face("f2"), face("f3"), face("f4")],
    price: 50,
    blurb:
      "Cumbia, house, and new friends. Discounted list until midnight. Bring whoever you like.",
  },
  {
    id: "pena-marka",
    title: "La Marka Folk Night",
    category: "Music",
    cover: pic("pena-folk"),
    startsAt: "2026-06-26T21:00:00",
    dayKey: "2026-06-26",
    dayLabel: "Fri, Jun 26",
    weekday: "Friday",
    timeLabel: "21:00",
    isPast: false,
    place: "Calle Jaén",
    city: "La Paz",
    host: { name: "Lucía", avatar: face("host-lucia"), phone: "+59170000002" },
    attendees: 54,
    attendeeAvatars: [face("c1"), face("c2"), face("c3"), face("c4")],
    price: 40,
    blurb:
      "Charango, panpipes, and dancing till late. We've booked a long table, so join us. Cover includes a drink.",
  },
  {
    id: "cumbre-bici",
    title: "Downhill Ride from La Cumbre",
    category: "Sports",
    cover: pic("downhill-bici"),
    startsAt: "2026-06-27T08:00:00",
    dayKey: "2026-06-27",
    dayLabel: "Sat, Jun 27",
    weekday: "Saturday",
    timeLabel: "08:00",
    isPast: false,
    place: "La Cumbre",
    city: "La Paz",
    host: { name: "Tania", avatar: face("host-tania"), phone: "+59170000004" },
    attendees: 12,
    attendeeAvatars: [face("e1"), face("e2"), face("e3")],
    price: 120,
    blurb:
      "Guided route with bikes and helmets included. Beginner to intermediate level. Bring energy and a warm layer for the altitude.",
  },
  {
    id: "feria-miraflores",
    title: "Miraflores Design Fair",
    category: "Culture",
    cover: pic("feria-diseno"),
    startsAt: "2026-06-27T11:00:00",
    dayKey: "2026-06-27",
    dayLabel: "Sat, Jun 27",
    weekday: "Saturday",
    timeLabel: "11:00",
    isPast: false,
    place: "Parque Triangular",
    city: "La Paz",
    host: { name: "Andrés", avatar: face("host-andres"), phone: "+59170000003" },
    attendees: 21,
    attendeeAvatars: [face("d1"), face("d2"), face("d3")],
    price: null,
    blurb:
      "Illustration, ceramics, and specialty coffee from local brands. Perfect for a relaxed Saturday stroll.",
  },
  {
    id: "taller-ceramica",
    title: "Andean Pottery Workshop",
    category: "Culture",
    cover: pic("ceramica-taller"),
    startsAt: "2026-07-01T16:00:00",
    dayKey: "2026-07-01",
    dayLabel: "Wed, Jul 1",
    weekday: "Wednesday",
    timeLabel: "16:00",
    isPast: false,
    place: "Sopocachi",
    city: "La Paz",
    host: { name: "Inés", avatar: face("host-ines"), phone: "+59170000006" },
    attendees: 9,
    attendeeAvatars: [face("g1"), face("g2")],
    price: 80,
    blurb:
      "Make your own piece using traditional techniques. Materials included, and you take it home. Limited spots.",
  },
  {
    id: "trail-muela",
    title: "Hike to Muela del Diablo",
    category: "Outdoors",
    cover: pic("muela-diablo"),
    startsAt: "2026-07-06T07:30:00",
    dayKey: "2026-07-06",
    dayLabel: "Mon, Jul 6",
    weekday: "Monday",
    timeLabel: "07:30",
    isPast: false,
    place: "Pedregal",
    city: "La Paz",
    host: { name: "Gabriel", avatar: face("host-gabriel"), phone: "+59170000007" },
    attendees: 27,
    attendeeAvatars: [face("h1"), face("h2"), face("h3")],
    price: null,
    blurb:
      "Half-day hike with incredible views. Easy pace, and we stop for breakfast at the top. Bring water and sunscreen.",
  },
  {
    id: "jazz-sopocachi",
    title: "Jazz Night in Sopocachi",
    category: "Music",
    cover: pic("jazz-night"),
    startsAt: "2026-06-14T20:00:00",
    dayKey: "2026-06-14",
    dayLabel: "Sat, Jun 14",
    weekday: "Saturday",
    timeLabel: "20:00",
    isPast: true,
    place: "Café Berlín",
    city: "La Paz",
    host: { name: "Nadia", avatar: face("host-nadia"), phone: "+59170000008" },
    attendees: 41,
    attendeeAvatars: [face("i1"), face("i2"), face("i3")],
    price: 35,
    blurb:
      "Live trio, low lights, and good wine. A calm night to close out the week.",
  },
  {
    id: "feria-libro",
    title: "La Paz Book Fair",
    category: "Culture",
    cover: pic("feria-libro"),
    startsAt: "2026-06-08T15:00:00",
    dayKey: "2026-06-08",
    dayLabel: "Sun, Jun 8",
    weekday: "Sunday",
    timeLabel: "15:00",
    isPast: true,
    place: "Campo Ferial",
    city: "La Paz",
    host: { name: "Hugo", avatar: face("host-hugo"), phone: "+59170000009" },
    attendees: 63,
    attendeeAvatars: [face("j1"), face("j2"), face("j3"), face("j4")],
    price: null,
    blurb:
      "Independent publishers, talks, and signings. Bring a list, because you always leave with more books than you planned.",
  },
];

export function findEvent(id: string): AygoEvent | undefined {
  return events.find((e) => e.id === id);
}
