// Mock content for the Discover landing (/discover): category browse tiles and
// featured community calendars. Counts are illustrative — data lands later.
// Images reuse the event photo seeds so categories show relevant scenes.

import type { Category } from "@/types";

const pic = (seed: string, w = 480, h = 360) =>
  `https://picsum.photos/seed/${seed}/${w}/${h}`;

/** "Browse by category" tiles. Icons/tints come from CATEGORY_META. */
export const CATEGORY_BROWSE: { category: Category; count: string; image: string }[] = [
  { category: "Music", count: "1.2K", image: pic("jazz-night") },
  { category: "Food", count: "381", image: pic("saltena-morning") },
  { category: "Culture", count: "2K", image: pic("feria-diseno") },
  { category: "Outdoors", count: "640", image: pic("killikilli-sunset") },
  { category: "Party", count: "1.5K", image: pic("after-prado") },
  { category: "Sports", count: "920", image: pic("downhill-bici") },
];

export type Calendar = {
  id: string;
  name: string;
  logo: string;
  cover: string;
  description: string;
  location?: string;
};

/** Featured community calendars — curated collections of events. */
export const FEATURED_CALENDARS: Calendar[] = [
  {
    id: "andes-outdoors",
    name: "Andes Outdoors",
    logo: pic("cal-andes", 120, 120),
    cover: pic("muela-diablo"),
    location: "La Paz",
    description: "Hikes, summits, and bike descents across the Bolivian Andes.",
  },
  {
    id: "pacena-nights",
    name: "Paceña Nightlife",
    logo: pic("cal-nights", 120, 120),
    cover: pic("after-prado"),
    description: "Cumbia, house, and afters around the city. Find your next night out.",
  },
  {
    id: "cultura-viva",
    name: "Cultura Viva",
    logo: pic("cal-cultura", 120, 120),
    cover: pic("pena-folk"),
    description: "Fairs, workshops, and gallery openings from local artists and makers.",
  },
  {
    id: "mercados-food",
    name: "Mercados & Food",
    logo: pic("cal-food", 120, 120),
    cover: pic("ceramica-taller"),
    location: "La Paz",
    description: "Street-food crawls and market tastings, a new spot every week.",
  },
];
