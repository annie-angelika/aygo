// The city explorer, split in two halves:
//
// - CITY_DATA — serializable city facts, kept in `lib/cities-seed.ts` (pure
//   data, safe to import server-side). This is the SEED for the backend's
//   `cities` table; the live list (with real, computed event counts) comes from
//   `GET /api/cities` via `useCities()`. Counts here are 0 on purpose — only
//   the backend knows how many events a city really has.
// - CITY_META — presentation config (react-icons component + Tailwind tint),
//   which a JSON backend can't return. Keyed by slug, with a default for
//   cities added later from the admin/backend. Class strings are literal so
//   Tailwind keeps them.

import type { IconType } from "react-icons";
import {
  LuBird,
  LuBuilding,
  LuBuilding2,
  LuCastle,
  LuChurch,
  LuDrum,
  LuGem,
  LuLandmark,
  LuMapPin,
  LuMountain,
  LuMountainSnow,
  LuPickaxe,
  LuSailboat,
  LuSun,
  LuTheater,
  LuTowerControl,
  LuTrainFront,
  LuTreePalm,
  LuTrees,
  LuUtensils,
  LuWaves,
  LuWine,
} from "react-icons/lu";
import type { CityInfo, Region } from "@/types";
import { CITY_DATA } from "@/lib/cities-seed";

export type { CityInfo, Region } from "@/types";
export { CITY_DATA, findCityByName } from "@/lib/cities-seed";

/** A city ready to render: backend facts + client presentation. */
export type City = CityInfo & { Icon: IconType; tint: string };

export const REGIONS: Region[] = ["South America", "North America", "Europe"];

/** Landmark icon + tint per city. Anything unknown gets the default pin. */
const CITY_META: Record<string, { Icon: IconType; tint: string }> = {
  "la-paz": { Icon: LuMountainSnow, tint: "bg-amber-500" },
  "el-alto": { Icon: LuBuilding, tint: "bg-amber-600" },
  "santa-cruz": { Icon: LuSun, tint: "bg-lime-500" },
  cochabamba: { Icon: LuUtensils, tint: "bg-orange-500" },
  sucre: { Icon: LuLandmark, tint: "bg-rose-300" },
  oruro: { Icon: LuDrum, tint: "bg-red-500" },
  potosi: { Icon: LuMountain, tint: "bg-stone-500" },
  tarija: { Icon: LuWine, tint: "bg-purple-500" },
  trinidad: { Icon: LuTrees, tint: "bg-green-500" },
  cobija: { Icon: LuTreePalm, tint: "bg-emerald-400" },
  uyuni: { Icon: LuGem, tint: "bg-sky-400" },
  copacabana: { Icon: LuWaves, tint: "bg-blue-400" },
  coroico: { Icon: LuTrees, tint: "bg-lime-600" },
  samaipata: { Icon: LuCastle, tint: "bg-stone-400" },
  rurrenabaque: { Icon: LuBird, tint: "bg-teal-500" },
  tupiza: { Icon: LuMountain, tint: "bg-red-400" },
  villazon: { Icon: LuTrainFront, tint: "bg-orange-300" },
  llallagua: { Icon: LuPickaxe, tint: "bg-zinc-500" },
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
