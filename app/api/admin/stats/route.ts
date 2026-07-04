// GET /api/admin/stats → dashboard totals + recent creations. Admin only.

import { getStore } from "@/lib/server/store";
import { requireAdmin } from "@/lib/server/admin";
import { handler, json } from "@/lib/server/http";

export const GET = handler(async (req: Request) => {
  await requireAdmin(req);
  return json(await getStore().adminStats());
});
