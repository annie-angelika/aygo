// GET /api/me/registrations → { going, applied, stamps } for the current guest

import { getStore } from "@/lib/server/store";
import { getSessionId } from "@/lib/server/session";
import { handler, json } from "@/lib/server/http";

export const GET = handler(async () => {
  const sid = await getSessionId();
  return json(await getStore().getRegistrations(sid));
});
