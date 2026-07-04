// POST /api/admin/seed → one-off setup: create the schema and seed the catalog
// (events, travelers, discover content) from the seed data. Admin only —
// the `x-admin-token` header (scripts) or the admin cookie (dashboard).

import { getStore } from "@/lib/server/store";
import { requireAdmin } from "@/lib/server/admin";
import { handler, json } from "@/lib/server/http";

export const POST = handler(async (req: Request) => {
  await requireAdmin(req);
  const store = getStore();
  await store.init();
  const counts = await store.seed();
  return json({ ok: true, seeded: counts });
});
