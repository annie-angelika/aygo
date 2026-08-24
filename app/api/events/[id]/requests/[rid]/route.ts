// The host deciding who gets in:
//   POST   /api/events/:id/requests/:rid  { approve } → approve (→ going) or reject
// Owner (or admin) only. `rid` is the applicant's request id from the manage
// data. The applicant is told either way.

import { getStore } from "@/lib/server/store";
import { requireEventOwner } from "@/lib/server/manage";
import { notifyGuest, eventHref } from "@/lib/server/notify";
import { handler, noContent, readJson, HttpError } from "@/lib/server/http";

export const POST = handler(
  async (req: Request, ctx: { params: Promise<{ id: string; rid: string }> }) => {
    const { id, rid } = await ctx.params;
    await requireEventOwner(id);
    const { approve } = await readJson<{ approve?: boolean }>(req);
    if (typeof approve !== "boolean")
      throw new HttpError(400, "approve must be true or false");

    const store = getStore();
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
