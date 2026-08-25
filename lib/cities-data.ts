// The city explorer, split in two halves:
//
// - CITY_DATA — serializable city facts, kept in `lib/cities-seed.ts` (pure
//   data, safe to import server-side). This is the SEED for the backend's
//   `cities` table; the live list (with real, computed event counts) comes from
//   `GET /api/cities` via `useCities()`. Counts here are 0 on purpose — only
//   the backend knows how many events a city really has.
// - CITY_META — presentation config (the department landmark mark),
//   which a JSON backend can't return. Keyed by slug, with a default for
//   cities added later from the admin/backend.

import type { ComponentType } from "react";
import { LuMapPin } from "react-icons/lu";

import {
  MarkLaPaz,
  MarkSantaCruz,
  MarkCochabamba,
  MarkOruro,
  MarkPotosi,
  MarkChuquisaca,
  MarkTarija,
  MarkBeni,
  MarkPando,
  type MarkProps,
} from "@/components/ui/brand-icons";
import type { CityInfo, Region } from "@/types";
import { CITY_DATA } from "@/lib/cities-seed";

export type { CityInfo, Region } from "@/types";
export { CITY_DATA, findCityByName, nearestCity } from "@/lib/cities-seed";

/** A city ready to render: backend facts + its landmark mark. */
export type CityIcon = ComponentType<MarkProps>;
export type City = CityInfo & { Icon: CityIcon };

export const REGIONS: Region[] = ["South America", "North America", "Europe"];

/**
 * The landmark mark per Bolivian department (see `components/ui/brand-icons`).
 * Every city shares the same navy + gold treatment; cities beyond Bolivia get
 * the default pin until they earn a mark of their own.
 */
const CITY_META: Record<string, { Icon: CityIcon }> = {
  "la-paz": { Icon: MarkLaPaz },
  "el-alto": { Icon: MarkLaPaz },
  "santa-cruz": { Icon: MarkSantaCruz },
  cochabamba: { Icon: MarkCochabamba },
  sucre: { Icon: MarkChuquisaca },
  oruro: { Icon: MarkOruro },
  potosi: { Icon: MarkPotosi },
  tarija: { Icon: MarkTarija },
  trinidad: { Icon: MarkBeni },
  cobija: { Icon: MarkPando },
};

/** The nine department capitals, in the order the Discover grid shows them. */
export const DEPARTMENT_CAPITALS = [
  "la-paz",
  "santa-cruz",
  "cochabamba",
  "sucre",
  "potosi",
  "oruro",
  "tarija",
  "trinidad",
  "cobija",
] as const;

const DEFAULT_META = { Icon: LuMapPin as CityIcon };

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
