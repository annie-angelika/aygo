// GET /api/categories → per-interest stats (real counts) + page copy

import { getStore } from "@/lib/server/store";
import { handler, json } from "@/lib/server/http";

export const GET = handler(async () => {
  return json(await getStore().listCategoryStats());
});
