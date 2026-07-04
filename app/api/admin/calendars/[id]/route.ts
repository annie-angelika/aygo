// DELETE /api/admin/calendars/:id → remove a featured calendar. Admin only.

import { getStore } from "@/lib/server/store";
import { requireAdmin } from "@/lib/server/admin";
import { handler, noContent, HttpError } from "@/lib/server/http";

export const DELETE = handler(
  async (req: Request, ctx: { params: Promise<{ id: string }> }) => {
    await requireAdmin(req);
    const { id } = await ctx.params;
    const existed = await getStore().deleteCalendar(id);
    if (!existed) throw new HttpError(404, "Calendar not found");
    return noContent();
  },
);
