// Free-text location → coordinates, via OpenStreetMap's Nominatim (free, no
// key; usage policy = 1 req/s + a descriptive User-Agent, which fits our
// write-time-only usage: we geocode ONCE when an event is created/edited and
// store the result — never per request or per render). A failure just returns
// null; the event stays un-mapped rather than blocking the write.
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
    aliases: [info.name, ...(info.aliases ?? []), info.country, "bolivia"],
  };
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
    const key = `${r.lat},${r.lon}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

/**
 * One query: around the device first (when allowed), then the city box, then
 * the whole country — merged in that order so what is close wins, and a venue
 * in another city (Uyuni while La Paz is selected) still shows up after it.
 */
async function lookup(q: string, limit: number, scope?: SearchScope): Promise<Row[]> {
  // The three passes run together (one round-trip, not three) and merge in
  // priority order: near the device, the city's box, the whole country.
  const passes = await Promise.all([
    scope?.near ? nominatim(q, limit, scope, true, boxAround(scope.near)) : Promise.resolve([]),
    scope?.bbox ? nominatim(q, limit, scope, true) : Promise.resolve([]),
    nominatim(q, limit, scope, false),
  ]);
  const rows = dedupe(passes.flat()).filter((r) => mentions(r, q));
  // Venues whose own name matches outrank places that only match by address
  // (a plaza in "Provincia Villarroel" vs. Plaza Villarroel itself).
  const byName = (r: Row) => (mentions({ ...r, display_name: r.name ?? "" }, q) ? 0 : 1);
  return rows.sort((a, b) => byName(a) - byName(b)).slice(0, limit);
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
