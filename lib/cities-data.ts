// The city explorer, split in two halves:
//
// - CITY_DATA — serializable city facts. This is the SEED for the backend's
//   `cities` table; the live list (with real, computed event counts) comes from
//   `GET /api/cities` via `useCities()`. Counts here are 0 on purpose — only
//   the backend knows how many events a city really has.
// - CITY_META — presentation config (react-icons component + Tailwind tint),
//   which a JSON backend can't return. Keyed by slug, with a default for
//   cities added later from the admin/backend. Class strings are literal so
//   Tailwind keeps them.

import type { IconType } from "react-icons";
import {
  LuLandmark,
  LuBuilding,
  LuBuilding2,
  LuChurch,
  LuMapPin,
  LuMountain,
  LuMountainSnow,
  LuTheater,
  LuSailboat,
  LuTowerControl,
  LuSun,
  LuUtensils,
} from "react-icons/lu";
import type { CityInfo, Region } from "@/types";

export type { CityInfo, Region } from "@/types";

/** A city ready to render: backend facts + client presentation. */
export type City = CityInfo & { Icon: IconType; tint: string };

export const REGIONS: Region[] = ["South America", "North America", "Europe"];

/** Seed data (no counts — the backend computes those from real events). */
export const CITY_DATA: Omit<CityInfo, "eventCount">[] = [
  // — Bolivia's big cities —
  { slug: "la-paz", name: "La Paz", country: "Bolivia", region: "South America", tagline: "Peñas, ferias, hikes and rooftop sunsets across the highest city in the world." },
  { slug: "santa-cruz", name: "Santa Cruz", country: "Bolivia", region: "South America", tagline: "Warm nights, live music and the busiest scene in the lowlands." },
  { slug: "cochabamba", name: "Cochabamba", country: "Bolivia", region: "South America", tagline: "The food capital — markets, long lunches and festivals." },
  { slug: "potosi", name: "Potosí", country: "Bolivia", region: "South America", tagline: "Colonial streets, silver-mine history and the gateway to the salar." },

  // — Rest of LATAM —
  { slug: "buenos-aires", name: "Buenos Aires", country: "Argentina", region: "South America", tagline: "Tango nights, art openings and late dinners." },
  { slug: "bogota", name: "Bogotá", country: "Colombia", region: "South America", tagline: "Markets, music and mountain escapes." },
  { slug: "medellin", name: "Medellín", country: "Colombia", region: "South America" },
  { slug: "lima", name: "Lima", country: "Peru", region: "South America" },
  { slug: "santiago", name: "Santiago", country: "Chile", region: "South America" },
  { slug: "rio-de-janeiro", name: "Rio de Janeiro", country: "Brazil", region: "South America" },
  { slug: "sao-paulo", name: "São Paulo", country: "Brazil", region: "South America" },
  { slug: "montevideo", name: "Montevideo", country: "Uruguay", region: "South America" },

  // — North America —
  { slug: "mexico-city", name: "Mexico City", country: "Mexico", region: "North America", tagline: "A nonstop calendar of art, food and music." },
  { slug: "new-york", name: "New York", country: "United States", region: "North America" },
  { slug: "toronto", name: "Toronto", country: "Canada", region: "North America" },

  // — Europe —
  { slug: "madrid", name: "Madrid", country: "Spain", region: "Europe" },
  { slug: "barcelona", name: "Barcelona", country: "Spain", region: "Europe" },
  { slug: "lisbon", name: "Lisbon", country: "Portugal", region: "Europe", tagline: "Miradouros, fado and sunshine by the river." },
  { slug: "berlin", name: "Berlin", country: "Germany", region: "Europe" },
  { slug: "paris", name: "Paris", country: "France", region: "Europe" },
];

/** Landmark icon + tint per city. Anything unknown gets the default pin. */
const CITY_META: Record<string, { Icon: IconType; tint: string }> = {
  "la-paz": { Icon: LuMountainSnow, tint: "bg-amber-500" },
  "santa-cruz": { Icon: LuSun, tint: "bg-lime-500" },
  cochabamba: { Icon: LuUtensils, tint: "bg-orange-500" },
  potosi: { Icon: LuMountain, tint: "bg-stone-500" },
  "buenos-aires": { Icon: LuTheater, tint: "bg-rose-400" },
  bogota: { Icon: LuLandmark, tint: "bg-orange-400" },
  medellin: { Icon: LuBuilding, tint: "bg-sky-500" },
  lima: { Icon: LuChurch, tint: "bg-orange-600" },
  santiago: { Icon: LuMountainSnow, tint: "bg-indigo-500" },
  "rio-de-janeiro": { Icon: LuMountain, tint: "bg-emerald-600" },
  "sao-paulo": { Icon: LuBuilding2, tint: "bg-slate-500" },
  montevideo: { Icon: LuSailboat, tint: "bg-cyan-500" },
  "mexico-city": { Icon: LuLandmark, tint: "bg-emerald-500" },
  "new-york": { Icon: LuBuilding2, tint: "bg-indigo-500" },
  toronto: { Icon: LuTowerControl, tint: "bg-red-400" },
  madrid: { Icon: LuChurch, tint: "bg-fuchsia-500" },
  barcelona: { Icon: LuChurch, tint: "bg-rose-500" },
  lisbon: { Icon: LuSailboat, tint: "bg-cyan-600" },
  berlin: { Icon: LuLandmark, tint: "bg-violet-500" },
  paris: { Icon: LuTowerControl, tint: "bg-blue-500" },
};

const DEFAULT_META = { Icon: LuMapPin, tint: "bg-neutral-500" };

/** Dress backend city facts with their client presentation. */
export function withCityMeta(info: CityInfo): City {
  return { ...info, ...(CITY_META[info.slug] ?? DEFAULT_META) };
}

/**
 * Static resolution over the seed (slug routing + instant hero identity).
 * Live counts still come from the API; this never carries a real count.
 */
export function findCity(slug: string): City | undefined {
  const info = CITY_DATA.find((c) => c.slug === slug);
  return info ? withCityMeta({ ...info, eventCount: 0 }) : undefined;
}

/** Seed slugs for static params. */
export const CITIES: City[] = CITY_DATA.map((c) =>
  withCityMeta({ ...c, eventCount: 0 }),
);
