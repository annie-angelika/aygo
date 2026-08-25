// POST /api/admin/calendars → create or update a featured calendar. Admin only.

import { getStore } from "@/lib/server/store";
import { requireAdmin } from "@/lib/server/admin";
import { expectObject, str, optStr, enumOf, httpsUrl, SLUG } from "@/lib/server/validate";
import { handler, json, readJson } from "@/lib/server/http";
import { CATEGORIES } from "@/lib/events-data";
import type { AdminCalendarInput } from "@/lib/server/store/types";

export const POST = handler(async (req: Request) => {
  await requireAdmin(req);
  const b = expectObject(await readJson<unknown>(req, 256 * 1024), "calendar");
  // Artwork: an https URL, or one of our own files (public/covers, the mark).
  const LOCAL = /^\/(covers\/[a-z0-9-]{1,60}\.(png|jpg|jpeg|webp)|aygo-(light|dark)\.png)$/;
  const url = (v: unknown, f: string) => {
    const s = optStr(v, f, { max: 1024 });
    if (!s) return "";
    return LOCAL.test(s) ? s : httpsUrl(s, f);
  };
  const input: AdminCalendarInput = {
    id: optStr(b.id, "id", { max: 64, pattern: SLUG }),
    name: str(b.name, "name", { max: 80 }),
    description: str(b.description, "description", { max: 1000, multiline: true }),
    logo: url(b.logo, "logo"),
    cover: url(b.cover, "cover"),
    location: optStr(b.location, "location", { max: 80 }),
    subscribers: optStr(b.subscribers, "subscribers", { max: 20 }),
    featured: optStr(b.featured, "featured", { max: 80 }),
    category: b.category ? enumOf(b.category, "category", CATEGORIES) : undefined,
  };
  return json(await getStore().upsertCalendar(input), input.id ? 200 : 201);
});
