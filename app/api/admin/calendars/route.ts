// POST /api/admin/calendars → create or update a featured calendar. Admin only.

import { getStore } from "@/lib/server/store";
import { requireAdmin } from "@/lib/server/admin";
import { handler, json, readJson, HttpError } from "@/lib/server/http";
import { CATEGORIES } from "@/lib/events-data";
import type { AdminCalendarInput } from "@/lib/server/store/types";

export const POST = handler(async (req: Request) => {
  await requireAdmin(req);
  const input = await readJson<AdminCalendarInput>(req);

  if (!input.name?.trim()) throw new HttpError(400, "name is required");
  if (!input.description?.trim())
    throw new HttpError(400, "description is required");
  if (input.category && !CATEGORIES.includes(input.category))
    throw new HttpError(400, "category is not one of the app's interests");

  return json(await getStore().upsertCalendar(input), input.id ? 200 : 201);
});
