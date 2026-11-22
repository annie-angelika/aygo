// POST   /api/events/:id/guests/:rid → { paid } — the host confirms (or takes
//        back) that a guest paid outside the app (WhatsApp, link, cash). The
//        guest's spot only reads as "going" once it is paid.
// DELETE /api/events/:id/guests/:rid → the host removes a guest from the
// going list. Owner (or admin) only; the guest must actually be on the list.
// The guest is told, so the spot doesn't silently vanish from their tickets.

import { getStore } from "@/lib/server/store";
import { requireEventOwner } from "@/lib/server/manage";
import { notifyGuest, eventHref } from "@/lib/server/notify";
import { rateLimit, LIMITS } from "@/lib/server/rate-limit";
import { pathId, UUID, expectObject, bool } from "@/lib/server/validate";
import { handler, noContent, readJson, HttpError } from "@/lib/server/http";

export const POST = handler(
  async (req: Request, ctx: { params: Promise<{ id: string; rid: string }> }) => {
    const { id: rawId, rid } = await ctx.params;
    const id = pathId(rawId);
    if (!UUID.test(rid)) throw new HttpError(400, "Invalid guest id");
    const sid = await requireEventOwner(id);
    rateLimit(req, "host:action", sid, LIMITS.hostAction);
    const paid = bool(expectObject(await readJson(req), "guest").paid, "paid");
    const store = getStore();
    const regs = await store.getRegistrations(rid);
    if (!regs.going.includes(id)) throw new HttpError(404, "That guest isn't on the list.");
    const was = regs.paid.includes(id);
    await store.setPaid(rid, id, paid);
    if (paid && !was) {
      const event = await store.getEvent(id);
      await notifyGuest(rid, id, {
        kind: "approved",
        title: `Payment confirmed — you're going to ${event?.title ?? "the event"}`,
        body: `${event?.host.name ?? "The host"} confirmed your payment. See you there!`,
        href: eventHref(id),
      });
    }
    return noContent();
  },
);

export const DELETE = handler(
  async (req: Request, ctx: { params: Promise<{ id: string; rid: string }> }) => {
    const { id: rawId, rid } = await ctx.params;
    const id = pathId(rawId);
    if (!UUID.test(rid)) throw new HttpError(400, "Invalid guest id");
    const sid = await requireEventOwner(id);
    rateLimit(req, "host:action", sid, LIMITS.hostAction);
    const store = getStore();
    if (!(await store.getRegistrations(rid)).going.includes(id))
      throw new HttpError(404, "That guest isn't on the list.");
    await store.setGoing(rid, id, false);
    const event = await store.getEvent(id);
    await notifyGuest(rid, id, {
      kind: "removed",
      title: `You were removed from ${event?.title ?? "the event"}`,
      body: `${event?.host.name ?? "The host"} took you off the guest list. Message them if that's a surprise.`,
      href: eventHref(id),
    });
    return noContent();
  },
);
