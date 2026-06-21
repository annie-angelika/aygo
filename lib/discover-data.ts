// Mock content for the Discover landing (/discover): category browse tiles and
// featured community calendars. Counts are illustrative — data lands later.

import type { Category } from "@/types";

const pic = (seed: string) => `https://picsum.photos/seed/${seed}/200/200`;

/** "Browse by category" tiles. Icons/tints come from CATEGORY_META. */
export const CATEGORY_BROWSE: { category: Category; count: string }[] = [
  { category: "Music", count: "1.2K" },
  { category: "Food", count: "381" },
  { category: "Culture", count: "2K" },
  { category: "Outdoors", count: "640" },
  { category: "Party", count: "1.5K" },
  { category: "Sports", count: "920" },
];

export type Calendar = {
  id: string;
  name: string;
  logo: string;
  description: string;
  location?: string;
};

/** Featured community calendars — curated collections of events. */
export const FEATURED_CALENDARS: Calendar[] = [
  {
    id: "andes-outdoors",
    name: "Andes Outdoors",
    logo: pic("cal-andes"),
    location: "La Paz",
    description: "Hikes, summits, and bike descents across the Bolivian Andes.",
  },
  {
    id: "pacena-nights",
    name: "Paceña Nightlife",
    logo: pic("cal-nights"),
    description: "Cumbia, house, and afters around the city. Find your next night out.",
  },
  {
    id: "cultura-viva",
    name: "Cultura Viva",
    logo: pic("cal-cultura"),
    description: "Fairs, workshops, and gallery openings from local artists and makers.",
  },
  {
    id: "mercados-food",
    name: "Mercados & Food",
    logo: pic("cal-food"),
    location: "La Paz",
    description: "Street-food crawls and market tastings, a new spot every week.",
  },
];
