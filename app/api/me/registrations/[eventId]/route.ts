// POST   /api/me/registrations/:eventId → RSVP (join)
// DELETE /api/me/registrations/:eventId → cancel RSVP

import { getStore } from "@/lib/server/store";
import { getSessionId } from "@/lib/server/session";
import { handler, noContent } from "@/lib/server/http";

type Ctx = { params: Promise<{ eventId: string }> };

export const POST = handler(async (_req: Request, ctx: Ctx) => {
  const sid = await getSessionId();
  const { eventId } = await ctx.params;
  await getStore().setGoing(sid, eventId, true);
  return noContent();
});

export const DELETE = handler(async (_req: Request, ctx: Ctx) => {
  const sid = await getSessionId();
  const { eventId } = await ctx.params;
  await getStore().setGoing(sid, eventId, false);
  return noContent();
});
