// Free-text location → coordinates, via OpenStreetMap data from two services:
// Nominatim (addresses, plazas, streets; usage policy = 1 req/s + a
// descriptive User-Agent) and Photon (komoot's typeahead index over the same
// data, which is what finds a café or a shop by its name — Nominatim wants a
// full address and returns nothing for "typica" or "alexander coffee"). Both
// are free and keyless. We geocode at write time and on the picker's
// debounced keystrokes, never per render. A failure just returns null; the
// event stays un-mapped rather than blocking the write.
//
// aygo is Bolivia-first: every lookup is bounded to Bolivia unless the host
// picked a city abroad, and a chosen city ranks its own box first. The search
// widens step by step — city box → whole country — and, when a query still
// finds nothing, it is CLEANED (the city/country words people naturally type,
// "…, La Paz, Bolivia", are dropped) and SHORTENED (trailing words removed)
// before retrying, so "playa uyuni la paz bolivia" still lands on Plaza Uyuni.

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
  /** The city's centre — the typeahead ranks places by distance from it. */
  center?: Coords;
  /** Words the host may type that name the scope itself (dropped when cleaning). */
  aliases?: string[];
  /** The device's position, when the host allowed it: searched first, tightly. */
  near?: Coords;
};

/** ~30 km around a point — the "near me" box searched before the city's. */
function boxAround({ lat, lng }: Coords): [number, number, number, number] {
  const d = 0.28;
  return [lng - d, lat - d, lng + d, lat + d];
}

/** Our home market — the fallback scope whenever no city is known. */
export const DEFAULT_SCOPE: SearchScope = {
  countryCode: "bo",
  aliases: ["bolivia"],
};

/** The search scope for a city name the host picked (Bolivia when unknown). */
export function scopeForCity(city?: string | null): SearchScope {
  if (!city) return DEFAULT_SCOPE;
  const info = findCityByName(city);
  if (!info) return DEFAULT_SCOPE;
  return {
    countryCode: info.countryCode,
    bbox: info.bbox,
    center: info.lat != null && info.lng != null ? { lat: info.lat, lng: info.lng } : undefined,
    aliases: [info.name, ...(info.aliases ?? []), info.country, "bolivia"],
  };
}

/** Bolivia, generously — the typeahead is bounded to this when no city box applies. */
const BOLIVIA_BBOX: [number, number, number, number] = [-69.7, -22.95, -57.4, -9.6];

type Row = {
  lat: string;
  lon: string;
  display_name: string;
  name?: string;
  address?: Record<string, string>;
};

// Nominatim's policy asks for an identifying User-Agent with a way to reach
// the operator; AYGO_CONTACT (an email or URL) fills that in per deployment.
const HEADERS = {
  "User-Agent": `aygo-events/1.0 (${process.env.AYGO_CONTACT ?? "https://github.com/aleregex/aygo"})`,
};

async function nominatim(
  q: string,
  limit: number,
  scope: SearchScope | undefined,
  bounded: boolean,
  box: [number, number, number, number] | undefined = scope?.bbox,
): Promise<Row[]> {
  const params = new URLSearchParams({
    format: "json",
    addressdetails: "1",
    "accept-language": "es",
    limit: String(limit),
    q,
  });
  if (scope?.countryCode) params.set("countrycodes", scope.countryCode);
  if (bounded && box) {
    const [w, s, e, n] = box;
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

type PhotonFeature = {
  geometry: { coordinates: [number, number] };
  properties: {
    name?: string;
    street?: string;
    housenumber?: string;
    district?: string;
    city?: string;
    county?: string;
    state?: string;
    country?: string;
    countrycode?: string;
    osm_key?: string;
    osm_value?: string;
  };
};

/**
 * Photon: name-first search over OSM — venues, shops, cafés — ranked by
 * distance from `bias` and kept inside `box`. Mapped onto Nominatim's row
 * shape so one ranking handles both.
 */
async function photon(
  q: string,
  limit: number,
  scope: SearchScope | undefined,
  box: [number, number, number, number] | undefined,
  bias: Coords | undefined,
): Promise<Row[]> {
  const params = new URLSearchParams({ q, limit: String(limit), lang: "default" });
  if (box) params.set("bbox", box.join(","));
  if (bias) {
    params.set("lat", String(bias.lat));
    params.set("lon", String(bias.lng));
  }
  try {
    const res = await fetch(`https://photon.komoot.io/api/?${params}`, {
      headers: HEADERS,
      signal: AbortSignal.timeout(4000),
    });
    if (!res.ok) return [];
    const body = (await res.json()) as { features?: PhotonFeature[] };
    const rows: Row[] = [];
    for (const f of body.features ?? []) {
      const p = f.properties;
      // Never leak another country: Photon's bbox is a box, not a border.
      if (scope?.countryCode && p.countrycode && p.countrycode.toLowerCase() !== scope.countryCode) continue;
      // Skip pure address rows (a street or a house number without a name):
      // they only come back here when the name index found nothing better.
      if (!p.name || p.osm_key === "highway" || p.osm_key === "place" && p.osm_value === "house") continue;
      const [lon, lat] = f.geometry.coordinates;
      const parts = [
        p.name,
        [p.street, p.housenumber].filter(Boolean).join(" "),
        p.district,
        p.city ?? p.county,
        p.state,
        p.country,
      ].filter((x): x is string => !!x && x.trim().length > 0);
      rows.push({
        lat: String(lat),
        lon: String(lon),
        name: p.name,
        display_name: [...new Set(parts)].join(", "),
        address: {
          ...(p.city ? { city: p.city } : null),
          ...(p.county ? { county: p.county } : null),
          ...(p.state ? { state: p.state } : null),
          ...(p.country ? { country: p.country } : null),
        },
      });
    }
    return rows;
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

const fold = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();

/**
 * Drop the scope's own names from a query ("plaza uyuni la paz bolivia" →
 * "plaza uyuni"): the scope already bounds the search, and Nominatim treats
 * every extra word as something that must match.
 */
export function cleanQuery(query: string, scope?: SearchScope): string {
  let q = ` ${fold(query).replace(/[,;]+/g, " ").replace(/\s+/g, " ").trim()} `;
  for (const alias of scope?.aliases ?? []) {
    const a = fold(alias).trim();
    if (a) q = q.split(` ${a} `).join(" ");
  }
  return q.replace(/\s+/g, " ").trim();
}

/** Venue-type words that never identify a place on their own. */
const GENERIC = new Set([
  "terraza", "cafe", "cafeteria", "restaurante", "restaurant", "salon", "discoteca",
  "teatro", "theater", "galeria", "gallery", "centro", "center", "plaza", "square",
  "parque", "park", "mirador", "calle", "street", "avenida", "avenue", "mercado",
  "market", "hotel", "hostal", "hostel", "club", "casa", "house", "iglesia", "church",
  "estadio", "stadium", "coliseo", "arena", "bar", "pub", "museo", "museum",
  "universidad", "university", "colegio", "escuela", "school", "the", "el", "la",
  "los", "las", "de", "del", "y", "and",
]);

/**
 * The queries to try, most specific first, without repeats. The cleaned query
 * goes first — with "la paz bolivia" left in, Nominatim happily returns any
 * "Plaza" in the department — and a query made only of generic words is never
 * sent (it would return random plazas instead of "no match").
 */
function candidates(query: string, scope?: SearchScope): string[] {
  const out: string[] = [];
  const push = (s: string) => {
    const t = s.trim();
    if (t.length < 3 || out.includes(t)) return;
    if (t.split(" ").every((w) => GENERIC.has(w))) return;
    out.push(t);
  };
  const cleaned = cleanQuery(query, scope);
  push(cleaned);
  if (cleaned === fold(query).trim()) push(query);
  // The same without venue-type words — "stadium hernando siles" is the
  // Estadio Hernando Siles in OSM; the type word only gets in the way.
  push(cleaned.split(" ").filter((w) => !GENERIC.has(w)).join(" "));
  // Shorten from the end — the first words are usually the venue itself.
  const words = cleaned.split(" ");
  for (let n = words.length - 1; n >= 2; n--) push(words.slice(0, n).join(" "));
  // Last resort: the distinctive word on its own ("terraza montículo" → the
  // Montículo lookout), skipping generic venue words.
  for (const w of words) if (w.length >= 5 && !GENERIC.has(w)) push(w);
  return out;
}

function dedupe(rows: Row[]): Row[] {
  const seen = new Set<string>();
  return rows.filter((r) => {
    // Nominatim and Photon describe the same OSM object with slightly
    // different precision; ~10 m is "the same place".
    const key = `${Number(r.lat).toFixed(4)},${Number(r.lon).toFixed(4)}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function inBox(r: Row, box: [number, number, number, number] | undefined): boolean {
  if (!box) return false;
  const lat = Number(r.lat);
  const lon = Number(r.lon);
  const [w, s, e, n] = box;
  return lon >= w && lon <= e && lat >= s && lat <= n;
}

/**
 * One query: around the device first (when allowed), then the city box, then
 * the whole country — merged in that order so what is close wins, and a venue
 * in another city (Uyuni while La Paz is selected) still shows up after it.
 */
async function lookup(q: string, limit: number, scope?: SearchScope): Promise<Row[]> {
  // Every pass runs together (one round-trip, not five) and merges in
  // priority order: near the device, the city's box, the whole country —
  // Photon (venues by name) and Nominatim (addresses, squares) side by side.
  const bias = scope?.near ?? scope?.center;
  const countryBox = scope?.bbox ?? (scope?.countryCode === "bo" ? BOLIVIA_BBOX : undefined);
  const passes = await Promise.all([
    scope?.near ? photon(q, limit, scope, boxAround(scope.near), scope.near) : Promise.resolve([]),
    scope?.near ? nominatim(q, limit, scope, true, boxAround(scope.near)) : Promise.resolve([]),
    scope?.bbox ? photon(q, limit, scope, scope.bbox, bias) : Promise.resolve([]),
    scope?.bbox ? nominatim(q, limit, scope, true) : Promise.resolve([]),
    photon(q, limit, scope, scope?.countryCode === "bo" ? BOLIVIA_BBOX : undefined, bias),
    nominatim(q, limit, scope, false),
  ]);
  const rows = dedupe(passes.flat()).filter((r) => mentions(r, q));
  // Venues whose own name matches outrank places that only match by address
  // (a plaza in "Provincia Villarroel" vs. Plaza Villarroel itself); within
  // each group, what is near the device or inside the chosen city comes first.
  const byName = (r: Row) => (mentions({ ...r, display_name: r.name ?? "" }, q) ? 0 : 1);
  const byPlace = (r: Row) =>
    scope?.near && inBox(r, boxAround(scope.near)) ? 0 : inBox(r, scope?.bbox) ? 1 : inBox(r, countryBox) ? 2 : 3;
  // Among places elsewhere in the country, a city we list beats a village
  // (Plaza 24 de Septiembre in Santa Cruz before the one in Mairana).
  const byCity = (r: Row) => {
    const a = r.address ?? {};
    return findCityByName(a.city || a.town || a.municipality || "") ? 0 : 1;
  };
  return rows
    .sort((a, b) => byName(a) - byName(b) || byPlace(a) - byPlace(b) || byCity(a) - byCity(b))
    .slice(0, limit);
}

/**
 * Nominatim pads thin results with loose matches ("plaza villaroel" → any
 * "Plaza" in the department). Keep a row only when its full address mentions
 * every distinctive word of the query; generic words (plaza, calle…) are free.
 */
function mentions(row: Row, q: string): boolean {
  const hay = fold(row.display_name);
  return q
    .split(" ")
    .filter((w) => w && !GENERIC.has(w))
    .every((w) => hay.includes(w));
}

/**
 * Live place search for the location picker. Bolivia-first, city-box-first;
 * never leaks results from other countries. Callers debounce (Nominatim allows
 * ~1 req/s), and each fallback step only runs when the previous one was empty.
 */
export async function searchPlaces(
  query: string,
  scope: SearchScope | undefined = DEFAULT_SCOPE,
  limit = 6,
): Promise<PlaceHit[]> {
  if (query.trim().length < 3) return [];
  for (const q of candidates(query, scope)) {
    const rows = await lookup(q, limit, scope);
    if (rows.length > 0) return rows.map(toHit).filter((h): h is PlaceHit => h !== null);
  }
  return [];
}

/** One best coordinate for a free-text location, within the scope when given. */
export async function geocode(
  query: string,
  scope: SearchScope | undefined = DEFAULT_SCOPE,
): Promise<Coords | null> {
  if (!query.trim()) return null;
  for (const q of candidates(query, scope)) {
    const rows = await lookup(q, 1, scope);
    const hit = rows[0] ? toHit(rows[0]) : null;
    if (hit) return { lat: hit.lat, lng: hit.lng };
  }
  return null;
}

/** A town or city (Nominatim "settlement"), with the box the place search uses. */
export type SettlementHit = {
  name: string;
  /** Department (state) it belongs to, when known. */
  state: string;
  lat: number;
  lng: number;
  bbox: [number, number, number, number];
};

/**
 * Cities and towns in Bolivia matching a name — the "other city" search of the
 * create flow, and what the server uses to add a city the seed doesn't have.
 */
export async function searchSettlements(query: string, limit = 6): Promise<SettlementHit[]> {
  const q = query.trim();
  if (q.length < 2) return [];
  const params = new URLSearchParams({
    format: "json",
    addressdetails: "1",
    "accept-language": "es",
    featureType: "settlement",
    countrycodes: DEFAULT_SCOPE.countryCode ?? "bo",
    limit: String(limit),
    q,
  });
  try {
    const res = await fetch(`https://nominatim.openstreetmap.org/search?${params}`, {
      headers: HEADERS,
      signal: AbortSignal.timeout(4000),
    });
    if (!res.ok) return [];
    const rows = (await res.json()) as (Row & { boundingbox?: string[] })[];
    const seen = new Set<string>();
    const out: SettlementHit[] = [];
    for (const r of rows) {
      const name = (r.name ?? r.display_name.split(",")[0]).trim();
      const lat = Number(r.lat);
      const lng = Number(r.lon);
      if (!name || !Number.isFinite(lat) || !Number.isFinite(lng)) continue;
      const key = fold(name);
      if (seen.has(key)) continue;
      seen.add(key);
      const bb = (r.boundingbox ?? []).map(Number);
      // Nominatim's box is [south, north, west, east]; ours is [west, south, east, north].
      // Pad it so a venue on the edge of town still counts as "in" the city.
      const pad = 0.05;
      const bbox: [number, number, number, number] =
        bb.length === 4 && bb.every(Number.isFinite)
          ? [bb[2] - pad, bb[0] - pad, bb[3] + pad, bb[1] + pad]
          : [lng - 0.2, lat - 0.2, lng + 0.2, lat + 0.2];
      out.push({ name, state: r.address?.state ?? "", lat, lng, bbox });
    }
    return out;
  } catch {
    return [];
  }
}
