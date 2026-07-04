// Free-text location → coordinates, via OpenStreetMap's Nominatim (free, no
// key; usage policy = 1 req/s + a descriptive User-Agent, which fits our
// write-time-only usage: we geocode ONCE when an event is created/edited and
// store the result — never per request or per render). A failure just returns
// null; the event stays un-mapped rather than blocking the write.

import "server-only";

export type Coords = { lat: number; lng: number };

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
