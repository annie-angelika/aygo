// GET /api/geocode/search?q=<text>[&city=<name>] → live place suggestions for
// the create flow's location picker. Fronts Nominatim (see lib/server/geocode);
// the client debounces so we stay within its usage policy. A city hint just
// biases relevance by appending it to the query.

import { searchPlaces } from "@/lib/server/geocode";
import { handler, json } from "@/lib/server/http";

export const GET = handler(async (req: Request) => {
  const params = new URL(req.url).searchParams;
  const q = params.get("q")?.trim() ?? "";
  const city = params.get("city")?.trim();
  const query = city && !q.toLowerCase().includes(city.toLowerCase())
    ? `${q}, ${city}`
    : q;
  return json(await searchPlaces(query));
});
