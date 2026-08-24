// GET /api/me/events → the drafts this session created (newest first). Hydrates
// the local "Hosting" list on a new browser or after switching accounts.

import { getStore } from "@/lib/server/store";
import { getSessionId } from "@/lib/server/session";
import { handler, json } from "@/lib/server/http";
import { stripDraftMedia } from "@/lib/create-event";

export const GET = handler(async () => {
  const sid = await getSessionId();
  // Ids + metadata only — the photos live on the event page, not in this list.
  return json((await getStore().listMyEvents(sid)).map(stripDraftMedia));
});
