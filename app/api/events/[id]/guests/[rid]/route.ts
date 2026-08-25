// DELETE /api/events/:id/guests/:rid → the host removes a guest from the
// going list. Owner (or admin) only; the guest must actually be on the list.

import { getStore } from "@/lib/server/store";
import { requireEventOwner } from "@/lib/server/manage";
import { rateLimit, LIMITS } from "@/lib/server/rate-limit";
import { pathId, UUID } from "@/lib/server/validate";
import { handler, noContent, HttpError } from "@/lib/server/http";

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
    return noContent();
  },
);
