// Mock data for the Luma-style city explorer on /discover. Cities are grouped
// by region; each links to /discover/<slug> ("what's happening" in that city).
// Class strings are literal so Tailwind keeps them.

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
};

export const REGIONS: Region[] = ["South America", "North America", "Europe"];

export const CITIES: City[] = [
  { slug: "la-paz", name: "La Paz", country: "Bolivia", region: "South America", eventCount: 10, subscribed: true, Icon: LuMountainSnow, tint: "bg-amber-500" },
  { slug: "bogota", name: "Bogotá", country: "Colombia", region: "South America", eventCount: 8, Icon: LuLandmark, tint: "bg-orange-400" },
  { slug: "buenos-aires", name: "Buenos Aires", country: "Argentina", region: "South America", subscribed: true, eventCount: 14, Icon: LuTheater, tint: "bg-rose-400" },
  { slug: "medellin", name: "Medellín", country: "Colombia", region: "South America", eventCount: 2, Icon: LuBuilding, tint: "bg-sky-500" },
  { slug: "rio-de-janeiro", name: "Rio de Janeiro", country: "Brazil", region: "South America", eventCount: 5, Icon: LuMountain, tint: "bg-emerald-600" },
  { slug: "sao-paulo", name: "São Paulo", country: "Brazil", region: "South America", eventCount: 6, Icon: LuBuilding2, tint: "bg-slate-500" },

  { slug: "mexico-city", name: "Mexico City", country: "Mexico", region: "North America", eventCount: 18, Icon: LuLandmark, tint: "bg-emerald-500" },
  { slug: "new-york", name: "New York", country: "United States", region: "North America", eventCount: 42, Icon: LuBuilding2, tint: "bg-indigo-500" },
  { slug: "toronto", name: "Toronto", country: "Canada", region: "North America", eventCount: 9, Icon: LuTowerControl, tint: "bg-red-400" },

  { slug: "lisbon", name: "Lisbon", country: "Portugal", region: "Europe", eventCount: 11, Icon: LuSailboat, tint: "bg-cyan-500" },
  { slug: "barcelona", name: "Barcelona", country: "Spain", region: "Europe", eventCount: 23, Icon: LuChurch, tint: "bg-fuchsia-500" },
  { slug: "berlin", name: "Berlin", country: "Germany", region: "Europe", eventCount: 31, Icon: LuLandmark, tint: "bg-violet-500" },
];

export function findCity(slug: string): City | undefined {
  return CITIES.find((c) => c.slug === slug);
}
