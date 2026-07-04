// DELETE /api/admin/events/:id → remove an event (catalog or user-created)
// and every per-guest reference to it. Admin only.

import { getStore } from "@/lib/server/store";
import { requireAdmin } from "@/lib/server/admin";
import { handler, noContent, HttpError } from "@/lib/server/http";

export const DELETE = handler(
  async (req: Request, ctx: { params: Promise<{ id: string }> }) => {
    await requireAdmin(req);
    const { id } = await ctx.params;
    const existed = await getStore().deleteEvent(id);
    if (!existed) throw new HttpError(404, "Event not found");
    return noContent();
  },
);
