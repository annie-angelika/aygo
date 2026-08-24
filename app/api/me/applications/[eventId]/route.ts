// POST   /api/me/applications/:eventId → request to join (optional { message });
//        the host is notified and decides from /manage
// DELETE /api/me/applications/:eventId → withdraw the request

import { getStore } from "@/lib/server/store";
import { getSessionId } from "@/lib/server/session";
import { validateMessage } from "@/lib/server/validate-draft";
import { notifyHost, displayName, manageHref } from "@/lib/server/notify";
import { handler, noContent, readJson, HttpError } from "@/lib/server/http";

type Ctx = { params: Promise<{ eventId: string }> };

export const POST = handler(async (req: Request, ctx: Ctx) => {
  const sid = await getSessionId();
  const { eventId } = await ctx.params;
  // Body is optional; tolerate an empty request.
  const body = await readJson<{ message?: string }>(req).catch(
    () => ({}) as { message?: string },
  );
  const note = body.message?.trim() ? validateMessage(body.message, "note") : undefined;
  const store = getStore();
  const event = await store.getEvent(eventId);
  if (!event) throw new HttpError(404, "Event not found");
  const already = (await store.getRegistrations(sid)).applied.includes(eventId);
  await store.setApplied(sid, eventId, true, note);
  if (!already) {
    await notifyHost(eventId, {
      kind: "request",
      title: `${await displayName(sid)} wants to join ${event.title}`,
      body: note ? `"${note.length > 100 ? `${note.slice(0, 97)}…` : note}"` : "Review the request to approve or decline.",
      href: manageHref(eventId, "guests"),
    });
  }
  return noContent();
});

export const DELETE = handler(async (_req: Request, ctx: Ctx) => {
  const sid = await getSessionId();
  const { eventId } = await ctx.params;
  await getStore().setApplied(sid, eventId, false);
  return noContent();
});
