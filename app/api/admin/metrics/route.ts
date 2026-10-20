// GET /api/admin/metrics → the traction report (totals + weekly series). Admin only.

import { requireAdmin } from "@/lib/server/admin";
import { metricsReport } from "@/lib/server/metrics";
import { handler, json } from "@/lib/server/http";

export const GET = handler(async (req: Request) => {
  await requireAdmin(req);
  return json(await metricsReport());
});
