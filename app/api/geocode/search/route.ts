// GET /api/geocode/search?q=<text>[&city=<name>] → live place suggestions for
// the create flow's location picker. Fronts Nominatim (see lib/server/geocode);
// the client debounces so we stay within its usage policy. The city bounds the
// search to its box + country, so results never come from another country.

import { searchPlaces, scopeForCity } from "@/lib/server/geocode";
import { handler, json } from "@/lib/server/http";

export const GET = handler(async (req: Request) => {
  const params = new URL(req.url).searchParams;
  const q = params.get("q")?.trim() ?? "";
  const city = params.get("city")?.trim();
  const scope = scopeForCity(city);
  // Unknown city (free text from an older draft): fall back to the old hint.
  const query =
    !scope && city && !q.toLowerCase().includes(city.toLowerCase())
      ? `${q}, ${city}`
      : q;
  return json(await searchPlaces(query, scope));
});
