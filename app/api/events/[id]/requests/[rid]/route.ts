// The host deciding who gets in:
//   POST   /api/events/:id/requests/:rid  { approve } → approve (→ going) or reject
// Owner (or admin) only. `rid` is the applicant's request id from the manage
// data, and it must be a REAL pending request — a host can't conjure guests
// (or put an arbitrary session on the list). The applicant is told either way.

import { getStore } from "@/lib/server/store";
import { requireEventOwner } from "@/lib/server/manage";
import { notifyGuest, eventHref } from "@/lib/server/notify";
import { rateLimit, LIMITS } from "@/lib/server/rate-limit";
import { pathId, expectObject, bool, UUID } from "@/lib/server/validate";
import { handler, noContent, readJson, HttpError } from "@/lib/server/http";

export const POST = handler(
  async (req: Request, ctx: { params: Promise<{ id: string; rid: string }> }) => {
    const { id: rawId, rid } = await ctx.params;
    const id = pathId(rawId);
    if (!UUID.test(rid)) throw new HttpError(400, "Invalid request id");
    const sid = await requireEventOwner(id);
    rateLimit(req, "host:action", sid, LIMITS.hostAction);
    const approve = bool(expectObject(await readJson<unknown>(req)).approve, "approve");

    const store = getStore();
    if (!(await store.getRegistrations(rid)).applied.includes(id))
      throw new HttpError(404, "That request no longer exists.");
    await store.setApplied(rid, id, false);
    if (approve) await store.setGoing(rid, id, true);
    const event = await store.getEvent(id);
    const title = event?.title ?? "the event";
    await notifyGuest(rid, id, {
      kind: approve ? "approved" : "rejected",
      title: approve ? `You're in: ${title}` : `Your request for ${title} was declined`,
      body: approve
        ? `${event?.host.name ?? "The host"} approved your request. See you there!`
        : "The host couldn't make room this time.",
      href: eventHref(id),
    });
    return noContent();
  },
);
