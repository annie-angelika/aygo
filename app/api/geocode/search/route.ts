// GET /api/geocode/search?q=<text>[&city=<name>][&lat=&lng=] → live place suggestions for
// the create flow's location picker. Fronts Nominatim (see lib/server/geocode);
// the client debounces and this is rate limited per IP so we stay within its
// usage policy. The search is Bolivia-first and city-box-first, so results
// never come from another country.

import { searchPlaces, scopeForCity } from "@/lib/server/geocode";
import { rateLimit, LIMITS } from "@/lib/server/rate-limit";
import { cleanText } from "@/lib/server/validate";
import { handler, json } from "@/lib/server/http";

export const GET = handler(async (req: Request) => {
  rateLimit(req, "geocode", null, LIMITS.geocode, LIMITS.geocode);
  const params = new URL(req.url).searchParams;
  const q = cleanText(params.get("q") ?? "").slice(0, 120);
  const city = cleanText(params.get("city") ?? "").slice(0, 60);
  if (q.length < 3) return json([]);
  // The device's position (when the host allowed it) is searched first.
  const lat = Number(params.get("lat"));
  const lng = Number(params.get("lng"));
  const near =
    Number.isFinite(lat) && Number.isFinite(lng) && Math.abs(lat) <= 90 && Math.abs(lng) <= 180
      ? { lat, lng }
      : undefined;
  // Bolivia-first: an unknown city still searches Bolivia; a known one ranks
  // its own box first and widens to the country (see lib/server/geocode).
  return json(await searchPlaces(q, { ...scopeForCity(city), near }));
});
