// Free-text location → coordinates, via OpenStreetMap's Nominatim (free, no
// key; usage policy = 1 req/s + a descriptive User-Agent, which fits our
// write-time-only usage: we geocode ONCE when an event is created/edited and
// store the result — never per request or per render). A failure just returns
// null; the event stays un-mapped rather than blocking the write.

import "server-only";

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

/**
 * Live place search for the location picker — same Nominatim endpoint as
 * {@link geocode} but returning several structured hits with address details.
 * Callers should debounce; the route that fronts this is invoked per keystroke
 * only after a pause, keeping us within Nominatim's 1 req/s policy.
 */
export async function searchPlaces(
  query: string,
  limit = 6,
): Promise<PlaceHit[]> {
  const q = query.trim();
  if (q.length < 3) return [];
  try {
    const url =
      `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1` +
      `&limit=${limit}&q=${encodeURIComponent(q)}`;
    const res = await fetch(url, {
      headers: { "User-Agent": "aygo-events (dev)" },
      signal: AbortSignal.timeout(4000),
    });
    if (!res.ok) return [];
    type Row = {
      lat: string;
      lon: string;
      display_name: string;
      name?: string;
      address?: Record<string, string>;
    };
    const rows = (await res.json()) as Row[];
    return rows
      .map((r) => {
        const lat = Number(r.lat);
        const lng = Number(r.lon);
        if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
        const a = r.address ?? {};
        const city =
          a.city || a.town || a.village || a.municipality || a.county || "";
        const name = r.name?.trim() || r.display_name.split(",")[0].trim();
        return { name, city, label: r.display_name, lat, lng } satisfies PlaceHit;
      })
      .filter((h): h is PlaceHit => h !== null);
  } catch {
    return [];
  }
}

export async function geocode(query: string): Promise<Coords | null> {
  const q = query.trim();
  if (!q) return null;
  try {
    const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(q)}`;
    const res = await fetch(url, {
      headers: { "User-Agent": "aygo-events (dev)" },
      signal: AbortSignal.timeout(4000),
    });
    if (!res.ok) return null;
    const results = (await res.json()) as { lat: string; lon: string }[];
    if (!results.length) return null;
    const lat = Number(results[0].lat);
    const lng = Number(results[0].lon);
    return Number.isFinite(lat) && Number.isFinite(lng) ? { lat, lng } : null;
  } catch {
    return null;
  }
}
