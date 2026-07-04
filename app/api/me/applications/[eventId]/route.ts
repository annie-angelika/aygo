// POST   /api/me/applications/:eventId → request to join (optional { message })
// DELETE /api/me/applications/:eventId → withdraw the request

import { getStore } from "@/lib/server/store";
import { getSessionId } from "@/lib/server/session";
import { handler, noContent, readJson } from "@/lib/server/http";

type Ctx = { params: Promise<{ eventId: string }> };

export const POST = handler(async (req: Request, ctx: Ctx) => {
  const sid = await getSessionId();
  const { eventId } = await ctx.params;
  // Body is optional; tolerate an empty request.
  const body = await readJson<{ message?: string }>(req).catch(
    () => ({}) as { message?: string },
  );
  await getStore().setApplied(sid, eventId, true, body.message);
  return noContent();
});

export const DELETE = handler(async (_req: Request, ctx: Ctx) => {
  const sid = await getSessionId();
  const { eventId } = await ctx.params;
  await getStore().setApplied(sid, eventId, false);
  return noContent();
});
