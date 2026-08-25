// POST /api/me/stamps  { eventId } → collect the aygo for an attended event.
// The stamp is derived server-side from the catalog event, so the client can't
// forge its contents — and it's only granted to someone who registered for the
// event, once it has started.

import { getStore } from "@/lib/server/store";
import { getSessionId } from "@/lib/server/session";
import { rateLimit, LIMITS } from "@/lib/server/rate-limit";
import { pathId, expectObject, str } from "@/lib/server/validate";
import { localToInstant } from "@/lib/event-time";
import { handler, noContent, readJson, HttpError } from "@/lib/server/http";
import { stampFromEvent } from "@/lib/server/store/catalog";

export const POST = handler(async (req: Request) => {
  const sid = await getSessionId();
  rateLimit(req, "stamps", sid, LIMITS.stamps);
  const eventId = pathId(str(expectObject(await readJson<unknown>(req)).eventId, "eventId", { max: 64 }), "eventId");

  const store = getStore();
  const event = await store.getEvent(eventId);
  if (!event) throw new HttpError(404, "Event not found");
  const regs = await store.getRegistrations(sid);
  if (regs.stamps.some((s) => s.eventId === eventId)) return noContent();
  if (!regs.going.includes(eventId))
    throw new HttpError(403, "Only registered guests can collect this event's aygo.");
  if (localToInstant(event.startsAt) > Date.now())
    throw new HttpError(400, "You can check in once the event has started.");

  await store.addStamp(sid, stampFromEvent(event));
  return noContent();
});
