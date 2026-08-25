// DELETE /api/admin/events/:id → remove an event (catalog or user-created)
// and every per-guest reference to it. Admin only.

import { getStore } from "@/lib/server/store";
import { requireAdmin } from "@/lib/server/admin";
import { pathId } from "@/lib/server/validate";
import { handler, noContent, HttpError } from "@/lib/server/http";

export const DELETE = handler(
  async (req: Request, ctx: { params: Promise<{ id: string }> }) => {
    await requireAdmin(req);
    const id = pathId((await ctx.params).id);
    const existed = await getStore().deleteEvent(id);
    if (!existed) throw new HttpError(404, "Event not found");
    return noContent();
  },
);
