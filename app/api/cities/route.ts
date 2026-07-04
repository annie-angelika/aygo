// GET /api/cities → the city explorer list, with real (computed) event counts

import { getStore } from "@/lib/server/store";
import { handler, json } from "@/lib/server/http";

export const GET = handler(async () => {
  return json(await getStore().listCities());
});
