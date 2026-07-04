// POST /api/me/stamps  { eventId } → collect the aygo for an attended event.
// The stamp is derived server-side from the catalog event, so the client can't
// forge its contents.

import { getStore } from "@/lib/server/store";
import { getSessionId } from "@/lib/server/session";
import { handler, noContent, readJson, HttpError } from "@/lib/server/http";
import { stampFromEvent } from "@/lib/server/store/catalog";

export const POST = handler(async (req: Request) => {
  const sid = await getSessionId();
  const { eventId } = await readJson<{ eventId: string }>(req);
  if (!eventId) throw new HttpError(400, "eventId is required");

  const event = await getStore().getEvent(eventId);
  if (!event) throw new HttpError(404, "Event not found");

  await getStore().addStamp(sid, stampFromEvent(event));
  return noContent();
});
