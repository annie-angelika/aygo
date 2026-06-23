// Mock data for the Luma-style city explorer on /discover. Cities are grouped
// by region; each links to /<slug> ("what's happening" in that city).
// We list big cities where events actually happen — Bolivia's metros lead,
// then the rest of LATAM and a few abroad. Class strings are literal so
// Tailwind keeps them.

import type { IconType } from "react-icons";
import {
  LuLandmark,
  LuBuilding,
  LuBuilding2,
  LuChurch,
  LuMountain,
  LuMountainSnow,
  LuTheater,
  LuSailboat,
  LuTowerControl,
  LuSun,
  LuUtensils,
} from "react-icons/lu";

export type Region = "South America" | "North America" | "Europe";

export type City = {
  slug: string;
  name: string;
  country: string;
  region: Region;
  /** Headline event count shown on the explorer card. */
  eventCount: number;
  subscribed?: boolean;
  Icon: IconType;
  /** Background tint for the circular landmark icon. */
  tint: string;
  /** One- or two-line blurb under the title on the city page (Luma-style). */
  tagline?: string;
};

export const REGIONS: Region[] = ["South America", "North America", "Europe"];

export const CITIES: City[] = [
  // — Bolivia's big cities —
  { slug: "la-paz", name: "La Paz", country: "Bolivia", region: "South America", eventCount: 24, subscribed: true, Icon: LuMountainSnow, tint: "bg-amber-500", tagline: "Peñas, ferias, hikes and rooftop sunsets across the highest city in the world." },
  { slug: "santa-cruz", name: "Santa Cruz", country: "Bolivia", region: "South America", eventCount: 19, Icon: LuSun, tint: "bg-lime-500", tagline: "Warm nights, live music and the busiest scene in the lowlands." },
  { slug: "cochabamba", name: "Cochabamba", country: "Bolivia", region: "South America", eventCount: 12, subscribed: true, Icon: LuUtensils, tint: "bg-orange-500", tagline: "The food capital — markets, long lunches and festivals." },

  // — Rest of LATAM —
  { slug: "buenos-aires", name: "Buenos Aires", country: "Argentina", region: "South America", subscribed: true, eventCount: 14, Icon: LuTheater, tint: "bg-rose-400", tagline: "Tango nights, art openings and late dinners." },
  { slug: "bogota", name: "Bogotá", country: "Colombia", region: "South America", eventCount: 9, Icon: LuLandmark, tint: "bg-orange-400", tagline: "Markets, music and mountain escapes." },
  { slug: "medellin", name: "Medellín", country: "Colombia", region: "South America", eventCount: 6, Icon: LuBuilding, tint: "bg-sky-500" },
  { slug: "lima", name: "Lima", country: "Peru", region: "South America", eventCount: 11, Icon: LuChurch, tint: "bg-orange-600" },
  { slug: "santiago", name: "Santiago", country: "Chile", region: "South America", eventCount: 8, Icon: LuMountainSnow, tint: "bg-indigo-500" },
  { slug: "rio-de-janeiro", name: "Rio de Janeiro", country: "Brazil", region: "South America", eventCount: 13, Icon: LuMountain, tint: "bg-emerald-600" },
  { slug: "sao-paulo", name: "São Paulo", country: "Brazil", region: "South America", eventCount: 16, Icon: LuBuilding2, tint: "bg-slate-500" },
  { slug: "montevideo", name: "Montevideo", country: "Uruguay", region: "South America", eventCount: 5, Icon: LuSailboat, tint: "bg-cyan-500" },

  // — North America —
  { slug: "mexico-city", name: "Mexico City", country: "Mexico", region: "North America", eventCount: 18, subscribed: true, Icon: LuLandmark, tint: "bg-emerald-500", tagline: "A nonstop calendar of art, food and music." },
  { slug: "new-york", name: "New York", country: "United States", region: "North America", eventCount: 42, Icon: LuBuilding2, tint: "bg-indigo-500" },
  { slug: "toronto", name: "Toronto", country: "Canada", region: "North America", eventCount: 9, Icon: LuTowerControl, tint: "bg-red-400" },

  // — Europe —
  { slug: "madrid", name: "Madrid", country: "Spain", region: "Europe", eventCount: 21, Icon: LuChurch, tint: "bg-fuchsia-500" },
  { slug: "barcelona", name: "Barcelona", country: "Spain", region: "Europe", eventCount: 23, Icon: LuChurch, tint: "bg-rose-500" },
  { slug: "lisbon", name: "Lisbon", country: "Portugal", region: "Europe", eventCount: 11, Icon: LuSailboat, tint: "bg-cyan-600", tagline: "Miradouros, fado and sunshine by the river." },
  { slug: "berlin", name: "Berlin", country: "Germany", region: "Europe", eventCount: 31, Icon: LuLandmark, tint: "bg-violet-500" },
  { slug: "paris", name: "Paris", country: "France", region: "Europe", eventCount: 38, Icon: LuTowerControl, tint: "bg-blue-500" },
];

export function findCity(slug: string): City | undefined {
  return CITIES.find((c) => c.slug === slug);
}
