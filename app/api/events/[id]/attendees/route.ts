// GET /api/events/:id/attendees → travelers attending the event

import { getStore } from "@/lib/server/store";
import { handler, json } from "@/lib/server/http";

export const GET = handler(
  async (_req: Request, ctx: { params: Promise<{ id: string }> }) => {
    const { id } = await ctx.params;
    return json(await getStore().getAttendees(id));
  },
);
