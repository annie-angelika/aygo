// POST /api/admin/seed → one-off setup: create the schema and seed the discover
// content (cities, calendars, interest pages). No demo events or people are
// ever seeded — everything guests see is created in the app. Admin only —
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
