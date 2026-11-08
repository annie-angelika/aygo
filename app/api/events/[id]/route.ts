// GET /api/events/:id → a single event
// DELETE /api/events/:id → the host removes their own event (guests, requests
// and feedback go with it). Owner (or admin) only.

import { getStore } from "@/lib/server/store";
import { requireEventOwner } from "@/lib/server/manage";
import { notifyGuest } from "@/lib/server/notify";
import { rateLimit, LIMITS } from "@/lib/server/rate-limit";
import { pathId } from "@/lib/server/validate";
import { handler, json, noContent, HttpError } from "@/lib/server/http";

export const GET = handler(
  async (_req: Request, ctx: { params: Promise<{ id: string }> }) => {
    const id = pathId((await ctx.params).id);
    const event = await getStore().getEvent(id);
    if (!event) throw new HttpError(404, "Event not found");
    return json(event);
  },
);

export const DELETE = handler(
  async (req: Request, ctx: { params: Promise<{ id: string }> }) => {
    const id = pathId((await ctx.params).id);
    const sid = await requireEventOwner(id);
    rateLimit(req, "host:action", sid, LIMITS.hostAction);
    const store = getStore();
    // Who was counting on it — read before the delete takes their rows along.
    const manage = await store.manageEvent(id);
    const existed = await store.deleteEvent(id);
    if (!existed) throw new HttpError(404, "Event not found");

    // Everyone with a spot or a pending request hears that it's off, so nobody
    // turns up to an event that no longer exists. The event page is gone, so
    // the notification leads to their tickets. A notification that fails to
    // save never undoes the delete.
    if (manage) {
      const { title, host } = manage.event;
      const guests = new Set([...manage.going, ...manage.requests].map((g) => g.requestId));
      guests.delete(sid);
      const sent = await Promise.allSettled(
        [...guests].map((guest) =>
          notifyGuest(guest, id, {
            kind: "cancelled",
            title: `${title} was cancelled`,
            body: `${host.name || "The host"} removed this event, so it's no longer happening. If you already paid, message them about a refund.`,
            href: "/home",
          }),
        ),
      );
      const failed = sent.filter((r) => r.status === "rejected").length;
      if (failed) console.error("event cancellation notices failed", { eventId: id, failed });
    }
    return noContent();
  },
);
