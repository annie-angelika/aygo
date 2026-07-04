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

/** The signed-in user's neutral base identity. No mock photo: the avatar is
 * empty so the UI falls back to initials until Pollar (or an upload) provides
 * a real one. */
export const CURRENT_USER = {
  name: "You",
  username: "you",
  avatar: "",
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
    lat: -16.4957,
    lng: -68.1372,
    host: { name: "Rosa", avatar: face("host-rosa"), phone: "+59171527005" },
    attendees: 0,
    attendeeAvatars: [],
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
    lat: -16.4893,
    lng: -68.1222,
    host: { name: "Marco", avatar: face("host-marco"), phone: "+59170000001" },
    attendees: 0,
    attendeeAvatars: [],
    price: null,
    blurb:
      "The best view of the city as the lights come on. Bring something to share. No rush, good vibes.",
  },
  {
    id: "morning-run-miraflores",
    title: "Sunday Morning Run",
    category: "Sports",
    cover: pic("morning-run"),
    startsAt: "2026-06-21T07:00:00",
    dayKey: "2026-06-21",
    dayLabel: "Today",
    weekday: "Sunday",
    timeLabel: "07:00",
    isPast: false,
    place: "Parque Urbano Central",
    city: "La Paz",
    lat: -16.5019,
    lng: -68.1252,
    host: { name: "Diego", avatar: face("host-diego"), phone: "+59170000021" },
    attendees: 0,
    attendeeAvatars: [],
    price: null,
    blurb:
      "Easy 5k loop around the park to start the day. Every pace welcome — we regroup at the fountain after.",
  },
  {
    id: "yoga-sopocachi",
    title: "Rooftop Yoga & Coffee",
    category: "Outdoors",
    cover: pic("rooftop-yoga"),
    startsAt: "2026-06-21T09:00:00",
    dayKey: "2026-06-21",
    dayLabel: "Today",
    weekday: "Sunday",
    timeLabel: "09:00",
    isPast: false,
    place: "Terraza Sopocachi",
    city: "La Paz",
    lat: -16.5121,
    lng: -68.1288,
    host: { name: "Valeria", avatar: face("host-valeria"), phone: "+59170000022" },
    attendees: 0,
    attendeeAvatars: [],
    price: 30,
    blurb:
      "Gentle flow with the mountains in view, then specialty coffee on the terrace. Mats provided, bring a layer.",
  },
  {
    id: "market-tour-rodriguez",
    title: "Mercado Rodríguez Food Tour",
    category: "Food",
    cover: pic("market-tour"),
    startsAt: "2026-06-21T11:00:00",
    dayKey: "2026-06-21",
    dayLabel: "Today",
    weekday: "Sunday",
    timeLabel: "11:00",
    isPast: false,
    place: "Mercado Rodríguez",
    city: "La Paz",
    lat: -16.503,
    lng: -68.1417,
    host: { name: "Carla", avatar: face("host-carla"), phone: "+59170000023" },
    attendees: 0,
    attendeeAvatars: [],
    price: 50,
    blurb:
      "Taste your way through the city's busiest market — fruit you've never tried, fresh juice, and street snacks.",
  },
  {
    id: "design-fair-miraflores",
    title: "Independent Design Fair",
    category: "Culture",
    cover: pic("design-fair"),
    startsAt: "2026-06-21T13:00:00",
    dayKey: "2026-06-21",
    dayLabel: "Today",
    weekday: "Sunday",
    timeLabel: "13:00",
    isPast: false,
    place: "Casa de la Cultura",
    city: "La Paz",
    lat: -16.4962,
    lng: -68.1338,
    host: { name: "Mateo", avatar: face("host-mateo"), phone: "+59170000024" },
    attendees: 0,
    attendeeAvatars: [],
    price: null,
    blurb:
      "Local makers, prints, and ceramics under one roof. Meet the artists and find something one of a kind.",
  },
  {
    id: "pickup-futbol",
    title: "Pickup Fútbol at Tembladerani",
    category: "Sports",
    cover: pic("pickup-futbol"),
    startsAt: "2026-06-21T15:00:00",
    dayKey: "2026-06-21",
    dayLabel: "Today",
    weekday: "Sunday",
    timeLabel: "15:00",
    isPast: false,
    place: "Cancha Tembladerani",
    city: "La Paz",
    lat: -16.5137,
    lng: -68.146,
    host: { name: "Luis", avatar: face("host-luis"), phone: "+59170000025" },
    attendees: 0,
    attendeeAvatars: [],
    price: 20,
    blurb:
      "Friendly 7-a-side, mixed levels. We split teams on the spot — just show up in something you can run in.",
  },
  {
    id: "vinyl-session",
    title: "Vinyl Listening Session",
    category: "Music",
    cover: pic("vinyl-session"),
    startsAt: "2026-06-21T16:30:00",
    dayKey: "2026-06-21",
    dayLabel: "Today",
    weekday: "Sunday",
    timeLabel: "16:30",
    isPast: false,
    place: "Café Magick",
    city: "La Paz",
    lat: -16.51,
    lng: -68.1263,
    host: { name: "Sofía", avatar: face("host-sofia-v"), phone: "+59170000026" },
    attendees: 0,
    attendeeAvatars: [],
    price: null,
    blurb:
      "Bring a record or just your ears. We spin a curated set of Bolivian and Latin grooves over coffee.",
  },
  {
    id: "empanada-crawl",
    title: "Tucumana & Empanada Crawl",
    category: "Food",
    cover: pic("empanada-crawl"),
    startsAt: "2026-06-21T18:30:00",
    dayKey: "2026-06-21",
    dayLabel: "Today",
    weekday: "Sunday",
    timeLabel: "18:30",
    isPast: false,
    place: "Plaza Avaroa",
    city: "La Paz",
    lat: -16.5093,
    lng: -68.1256,
    host: { name: "Andrés", avatar: face("host-andres"), phone: "+59170000027" },
    attendees: 0,
    attendeeAvatars: [],
    price: 35,
    blurb:
      "Three stops, the city's best fried snacks, one short walk between each. Come hungry and meet the crew.",
  },
  {
    id: "cumbia-rooftop",
    title: "Cumbia Rooftop Night",
    category: "Party",
    cover: pic("cumbia-rooftop"),
    startsAt: "2026-06-21T21:00:00",
    dayKey: "2026-06-21",
    dayLabel: "Today",
    weekday: "Sunday",
    timeLabel: "21:00",
    isPast: false,
    place: "Terraza Montículo",
    city: "La Paz",
    lat: -16.5094,
    lng: -68.1315,
    host: { name: "Nicole", avatar: face("host-nicole"), phone: "+59170000028" },
    attendees: 0,
    attendeeAvatars: [],
    price: 40,
    blurb:
      "Close out Sunday dancing under the stars — cumbia, house, and the best skyline in the city.",
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
    lat: -16.4995,
    lng: -68.1332,
    host: { name: "Beto", avatar: face("host-beto"), phone: "+59170000005" },
    attendees: 0,
    attendeeAvatars: [],
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
    lat: -16.4947,
    lng: -68.1355,
    host: { name: "Lucía", avatar: face("host-lucia"), phone: "+59170000002" },
    attendees: 0,
    attendeeAvatars: [],
    price: 40,
    blurb:
      "Calle Jaén turns into a peña for one night — charango, panpipes, and a guitar that gets passed around until someone finally starts singing. We've reserved the long table at the back, so there's room for whoever you decide to bring.\n\nDoors open at nine, but the music really only starts once the room fills up and the first round lands. Your cover includes a drink — a singani or a mate de coca, your call — and the kitchen keeps the salteñas and api coming until late.\n\nNo set list, no rush. Just old folk songs, a couple of new ones, and the kind of crowd that stays until the candles burn down. Come as you are; you'll leave with a few new friends and a song stuck in your head.",
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
    lat: -16.3354,
    lng: -68.0417,
    host: { name: "Tania", avatar: face("host-tania"), phone: "+59170000004" },
    attendees: 0,
    attendeeAvatars: [],
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
    lat: -16.4966,
    lng: -68.117,
    host: { name: "Andrés", avatar: face("host-andres"), phone: "+59170000003" },
    attendees: 0,
    attendeeAvatars: [],
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
    lat: -16.5107,
    lng: -68.129,
    host: { name: "Inés", avatar: face("host-ines"), phone: "+59170000006" },
    attendees: 0,
    attendeeAvatars: [],
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
    lat: -16.5673,
    lng: -68.0936,
    host: { name: "Gabriel", avatar: face("host-gabriel"), phone: "+59170000007" },
    attendees: 0,
    attendeeAvatars: [],
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
    lat: -16.5082,
    lng: -68.127,
    host: { name: "Nadia", avatar: face("host-nadia"), phone: "+59170000008" },
    attendees: 0,
    attendeeAvatars: [],
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
    lat: -16.5266,
    lng: -68.1063,
    host: { name: "Hugo", avatar: face("host-hugo"), phone: "+59170000009" },
    attendees: 0,
    attendeeAvatars: [],
    price: null,
    blurb:
      "Independent publishers, talks, and signings. Bring a list, because you always leave with more books than you planned.",
  },
  {
    id: "salar-uyuni",
    title: "Sunrise over Salar de Uyuni",
    category: "Outdoors",
    cover: pic("salar-uyuni"),
    startsAt: "2026-05-30T05:30:00",
    dayKey: "2026-05-30",
    dayLabel: "Sat, May 30",
    weekday: "Saturday",
    timeLabel: "05:30",
    isPast: true,
    place: "Salar de Uyuni",
    city: "Potosí",
    lat: -20.304,
    lng: -66.972,
    host: { name: "Camila", avatar: face("host-camila"), phone: "+59170000010" },
    attendees: 0,
    attendeeAvatars: [],
    price: 150,
    blurb:
      "The mirror at dawn — endless white and a sky that doubles on the ground. Transport and breakfast included. Dress warm; the desert is cold before the sun.",
  },
  {
    id: "mercado-rodriguez",
    title: "Mercado Rodríguez Food Crawl",
    category: "Food",
    cover: pic("mercado-food"),
    startsAt: "2026-05-22T09:00:00",
    dayKey: "2026-05-22",
    dayLabel: "Fri, May 22",
    weekday: "Friday",
    timeLabel: "09:00",
    isPast: true,
    place: "Mercado Rodríguez",
    city: "La Paz",
    lat: -16.503,
    lng: -68.1417,
    host: { name: "Fernanda", avatar: face("host-fernanda"), phone: "+59170000011" },
    attendees: 0,
    attendeeAvatars: [],
    price: null,
    blurb:
      "A morning loop through the city's liveliest market — fruit you've never seen, fresh juice, and a plate of whatever's good that day. Come hungry.",
  },
  {
    id: "chacaltaya",
    title: "Sunrise Hike at Chacaltaya",
    category: "Outdoors",
    cover: pic("chacaltaya"),
    startsAt: "2026-05-02T06:00:00",
    dayKey: "2026-05-02",
    dayLabel: "Sat, May 2",
    weekday: "Saturday",
    timeLabel: "06:00",
    isPast: true,
    place: "Chacaltaya",
    city: "La Paz",
    lat: -16.3506,
    lng: -68.1258,
    host: { name: "Rodrigo", avatar: face("host-rodrigo"), phone: "+59170000012" },
    attendees: 0,
    attendeeAvatars: [],
    price: 90,
    blurb:
      "One of the highest viewpoints near the city, best caught at first light. Short but steep at altitude — easy pace, warm layers, and a thermos for the top.",
  },
];

export function findEvent(id: string): AygoEvent | undefined {
  return events.find((e) => e.id === id);
}

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

/** Resolve an event from its short share code. */
export function findEventByCode(code: string): AygoEvent | undefined {
  return events.find((e) => eventCode(e.id) === code);
}
