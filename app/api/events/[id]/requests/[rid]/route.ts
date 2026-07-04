// The host deciding who gets in:
//   POST   /api/events/:id/requests/:rid  { approve } → approve (→ going) or reject
// Owner (or admin) only. `rid` is the applicant's request id from the manage data.

import { getStore } from "@/lib/server/store";
import { requireEventOwner } from "@/lib/server/manage";
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
    return noContent();
  },
);
