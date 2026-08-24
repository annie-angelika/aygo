// Free-text location → coordinates, via OpenStreetMap's Nominatim (free, no
// key; usage policy = 1 req/s + a descriptive User-Agent, which fits our
// write-time-only usage: we geocode ONCE when an event is created/edited and
// store the result — never per request or per render). A failure just returns
// null; the event stays un-mapped rather than blocking the write.
//
// Every lookup is BOUNDED to the chosen city: Nominatim's `viewbox` +
// `bounded=1` restricts hits to the city's box, `countrycodes` to its country,
// so "Plaza" in La Paz never resolves to La Paz, Mexico. When the box yields
// nothing (a venue just outside town) we fall back to the country, and only
// then to the bare query.

import "server-only";
import { findCityByName } from "@/lib/cities-seed";

export type Coords = { lat: number; lng: number };

/** A place suggestion for the create flow's location search. */
export type PlaceHit = {
  /** The venue / place name (first, most specific part of the address). */
  name: string;
  /** City/town the place sits in, when Nominatim resolves one. */
  city: string;
  /** Full human-readable address, for the suggestion's secondary line. */
  label: string;
  lat: number;
  lng: number;
};

/** Where to look: a city's box + country, or just a country. */
export type SearchScope = {
  countryCode?: string;
  bbox?: [number, number, number, number];
};

/** The search scope for a city name the host picked (undefined → unbounded). */
export function scopeForCity(city?: string | null): SearchScope | undefined {
  if (!city) return undefined;
  const info = findCityByName(city);
  return info ? { countryCode: info.countryCode, bbox: info.bbox } : undefined;
}

type Row = {
  lat: string;
  lon: string;
  display_name: string;
  name?: string;
  address?: Record<string, string>;
};

const HEADERS = { "User-Agent": "aygo-events (dev)" };

async function nominatim(
  q: string,
  limit: number,
  scope: SearchScope | undefined,
  bounded: boolean,
): Promise<Row[]> {
  const params = new URLSearchParams({
    format: "json",
    addressdetails: "1",
    "accept-language": "es",
    limit: String(limit),
    q,
  });
  if (scope?.countryCode) params.set("countrycodes", scope.countryCode);
  if (bounded && scope?.bbox) {
    const [w, s, e, n] = scope.bbox;
    params.set("viewbox", `${w},${n},${e},${s}`);
    params.set("bounded", "1");
  }
  try {
    const res = await fetch(`https://nominatim.openstreetmap.org/search?${params}`, {
      headers: HEADERS,
      signal: AbortSignal.timeout(4000),
    });
    if (!res.ok) return [];
    return (await res.json()) as Row[];
  } catch {
    return [];
  }
}

function toHit(r: Row): PlaceHit | null {
  const lat = Number(r.lat);
  const lng = Number(r.lon);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  const a = r.address ?? {};
  const city = a.city || a.town || a.village || a.municipality || a.county || "";
  const name = r.name?.trim() || r.display_name.split(",")[0].trim();
  return { name, city, label: r.display_name, lat, lng };
}

/**
 * Live place search for the location picker. Tries the city box first, then
 * the whole country; never leaks results from other countries when a scope is
 * known. Callers debounce (Nominatim allows ~1 req/s).
 */
export async function searchPlaces(
  query: string,
  scope?: SearchScope,
  limit = 6,
): Promise<PlaceHit[]> {
  const q = query.trim();
  if (q.length < 3) return [];
  let rows = await nominatim(q, limit, scope, true);
  if (rows.length === 0 && scope?.bbox) rows = await nominatim(q, limit, scope, false);
  return rows.map(toHit).filter((h): h is PlaceHit => h !== null);
}

/** One best coordinate for a free-text location, within the scope when given. */
export async function geocode(
  query: string,
  scope?: SearchScope,
): Promise<Coords | null> {
  const q = query.trim();
  if (!q) return null;
  let rows = await nominatim(q, 1, scope, true);
  if (rows.length === 0 && scope?.bbox) rows = await nominatim(q, 1, scope, false);
  const hit = rows[0] ? toHit(rows[0]) : null;
  return hit ? { lat: hit.lat, lng: hit.lng } : null;
}
