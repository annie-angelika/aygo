// POST   /api/me/registrations/:eventId → RSVP (join); the host is notified
// DELETE /api/me/registrations/:eventId → cancel RSVP

import { getStore } from "@/lib/server/store";
import { getSessionId } from "@/lib/server/session";
import { notifyHost, displayName, manageHref } from "@/lib/server/notify";
import { handler, noContent, HttpError } from "@/lib/server/http";

type Ctx = { params: Promise<{ eventId: string }> };

export const POST = handler(async (_req: Request, ctx: Ctx) => {
  const sid = await getSessionId();
  const { eventId } = await ctx.params;
  const store = getStore();
  const event = await store.getEvent(eventId);
  if (!event) throw new HttpError(404, "Event not found");
  const already = (await store.getRegistrations(sid)).going.includes(eventId);
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

export const DELETE = handler(async (_req: Request, ctx: Ctx) => {
  const sid = await getSessionId();
  const { eventId } = await ctx.params;
  await getStore().setGoing(sid, eventId, false);
  return noContent();
});
