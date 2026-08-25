// GET /api/events/:id/manage → everything the host's manage screen shows:
// the event + editable draft, real guest list, pending join requests,
// check-in count, and this event's feedback inbox. Owner (or admin) only.

import { getStore } from "@/lib/server/store";
import { requireEventOwner } from "@/lib/server/manage";
import { pathId } from "@/lib/server/validate";
import { handler, json, HttpError } from "@/lib/server/http";

export const GET = handler(
  async (_req: Request, ctx: { params: Promise<{ id: string }> }) => {
    const id = pathId((await ctx.params).id);
    await requireEventOwner(id);
    const data = await getStore().manageEvent(id);
    if (!data) throw new HttpError(404, "Event not found");
    return json(data);
  },
);
