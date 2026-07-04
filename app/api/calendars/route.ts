// GET /api/calendars → the featured community calendars

import { getStore } from "@/lib/server/store";
import { handler, json } from "@/lib/server/http";

export const GET = handler(async () => {
  return json(await getStore().listCalendars());
});
