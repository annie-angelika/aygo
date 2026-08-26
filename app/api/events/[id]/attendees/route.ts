// GET /api/events/:id/attendees → who is really going (RSVP rows)

import { getStore } from "@/lib/server/store";
import { pathId } from "@/lib/server/validate";
import { handler, json } from "@/lib/server/http";

export const GET = handler(
  async (_req: Request, ctx: { params: Promise<{ id: string }> }) => {
    const id = pathId((await ctx.params).id);
    return json(await getStore().getAttendees(id));
  },
);
