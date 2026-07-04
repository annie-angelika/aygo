// GET /api/events/:id → a single event
// DELETE /api/events/:id → the host removes their own event (guests, requests
// and feedback go with it). Owner (or admin) only.

import { getStore } from "@/lib/server/store";
import { requireEventOwner } from "@/lib/server/manage";
import { handler, json, noContent, HttpError } from "@/lib/server/http";

export const GET = handler(
  async (_req: Request, ctx: { params: Promise<{ id: string }> }) => {
    const { id } = await ctx.params;
    const event = await getStore().getEvent(id);
    if (!event) throw new HttpError(404, "Event not found");
    return json(event);
  },
);

export const DELETE = handler(
  async (_req: Request, ctx: { params: Promise<{ id: string }> }) => {
    const { id } = await ctx.params;
    await requireEventOwner(id);
    const existed = await getStore().deleteEvent(id);
    if (!existed) throw new HttpError(404, "Event not found");
    return noContent();
  },
);
