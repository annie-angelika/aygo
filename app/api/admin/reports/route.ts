// GET /api/admin/reports → the inbox: every question/report, newest first.

import { getStore } from "@/lib/server/store";
import { requireAdmin } from "@/lib/server/admin";
import { handler, json } from "@/lib/server/http";

export const GET = handler(async (req: Request) => {
  await requireAdmin(req);
  return json(await getStore().listReports());
});
