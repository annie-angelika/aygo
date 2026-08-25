// POST   /api/me/registrations/:eventId → RSVP (join); the host is notified
// DELETE /api/me/registrations/:eventId → cancel RSVP
//
// Rules: the event must exist and not be over, hosts can't register for their
// own event, approval-only events go through /me/applications instead, a full
// event (capacity reached) is sold out, and there's a per-session rate limit
// against RSVP spam.

import { getStore } from "@/lib/server/store";
import { getSessionId } from "@/lib/server/session";
import { notifyHost, displayName, manageHref } from "@/lib/server/notify";
import { rateLimit, LIMITS } from "@/lib/server/rate-limit";
import { pathId } from "@/lib/server/validate";
import { handler, noContent, HttpError } from "@/lib/server/http";

type Ctx = { params: Promise<{ eventId: string }> };

export const POST = handler(async (req: Request, ctx: Ctx) => {
  const sid = await getSessionId();
  const eventId = pathId((await ctx.params).eventId, "eventId");
  rateLimit(req, "register", sid, LIMITS.register);
  const store = getStore();
  const event = await store.getEvent(eventId);
  if (!event) throw new HttpError(404, "Event not found");
  if (event.isPast) throw new HttpError(400, "This event is over.");
  if ((await store.getEventOwner(eventId)) === sid)
    throw new HttpError(400, "You're the host — no need to register for your own event.");
  if (event.requiresApproval)
    throw new HttpError(400, "This event needs the host's approval — send a request instead.");
  const already = (await store.getRegistrations(sid)).going.includes(eventId);
  if (!already && event.capacity != null && event.attendees >= event.capacity)
    throw new HttpError(400, "This event is sold out.");
  await store.setGoing(sid, eventId, true);
  if (!already) {
    await notifyHost(eventId, {
      kind: "registration",
      title: `${await displayName(sid)} is going to ${event.title}`,
      body: "They just grabbed a spot.",
      href: manageHref(eventId, "guests"),
    });
  }
  return noContent();
});

export const DELETE = handler(async (req: Request, ctx: Ctx) => {
  const sid = await getSessionId();
  const eventId = pathId((await ctx.params).eventId, "eventId");
  rateLimit(req, "register", sid, LIMITS.register);
  await getStore().setGoing(sid, eventId, false);
  return noContent();
});
