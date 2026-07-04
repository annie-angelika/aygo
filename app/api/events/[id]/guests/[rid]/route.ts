// DELETE /api/events/:id/guests/:rid → the host removes a guest from the
// going list. Owner (or admin) only.

import { getStore } from "@/lib/server/store";
import { requireEventOwner } from "@/lib/server/manage";
import { handler, noContent } from "@/lib/server/http";

export const DELETE = handler(
  async (_req: Request, ctx: { params: Promise<{ id: string; rid: string }> }) => {
    const { id, rid } = await ctx.params;
    await requireEventOwner(id);
    await getStore().setGoing(rid, id, false);
    return noContent();
  },
);
