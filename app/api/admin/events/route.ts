// POST /api/admin/events → create or update a catalog event. Admin only.
// Derived fields (day labels, isPast) are computed server-side from startsAt.

import { getStore } from "@/lib/server/store";
import { requireAdmin } from "@/lib/server/admin";
import { geocode } from "@/lib/server/geocode";
import { handler, json, readJson, HttpError } from "@/lib/server/http";
import { CATEGORIES } from "@/lib/events-data";
import type { AdminEventInput } from "@/lib/server/store/types";

const DATETIME = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/;

export const POST = handler(async (req: Request) => {
  await requireAdmin(req);
  const input = await readJson<AdminEventInput>(req);

  if (!input.title?.trim()) throw new HttpError(400, "title is required");
  if (!DATETIME.test(input.startsAt ?? ""))
    throw new HttpError(400, "startsAt must be YYYY-MM-DDTHH:mm");
  if (!CATEGORIES.includes(input.category))
    throw new HttpError(400, "category is not one of the app's interests");
  if (!input.city?.trim()) throw new HttpError(400, "city is required");
  if (!input.place?.trim()) throw new HttpError(400, "place is required");

  // No coordinates from the form → geocode the venue once, at write time.
  // (Edits keep the existing pin via adminInputToEvent when this also misses.)
  if (input.lat == null || input.lng == null) {
    const coords = await geocode(`${input.place}, ${input.city}`);
    if (coords) {
      input.lat = coords.lat;
      input.lng = coords.lng;
    }
  }

  return json(await getStore().upsertEvent(input), input.id ? 200 : 201);
});
