// POST   /api/me/applications/:eventId → request to join (optional { message });
//        the host is notified and decides from /manage
// DELETE /api/me/applications/:eventId → withdraw the request
//
// Same guards as registrations (exists, not over, not your own event, rate
// limited) plus the note is length-capped and content-filtered.

import { getStore } from "@/lib/server/store";
import { getSessionId } from "@/lib/server/session";
import { validateMessage, LIMITS as TEXT } from "@/lib/server/validate-draft";
import { notifyHost, displayName, manageHref } from "@/lib/server/notify";
import { rateLimit, LIMITS } from "@/lib/server/rate-limit";
import { pathId, expectObject } from "@/lib/server/validate";
import { handler, noContent, readJson, HttpError } from "@/lib/server/http";

type Ctx = { params: Promise<{ eventId: string }> };

export const POST = handler(async (req: Request, ctx: Ctx) => {
  const sid = await getSessionId();
  const eventId = pathId((await ctx.params).eventId, "eventId");
  rateLimit(req, "register", sid, LIMITS.register);
  // Body is optional; tolerate an empty request.
  const body = expectObject(await readJson<unknown>(req).catch(() => ({})), "request");
  const note =
    typeof body.message === "string" && body.message.trim()
      ? validateMessage(body.message, "note", { max: TEXT.note, policy: "note" })
      : undefined;
  const store = getStore();
  const event = await store.getEvent(eventId);
  if (!event) throw new HttpError(404, "Event not found");
  if (event.isPast) throw new HttpError(400, "This event is over.");
  if ((await store.getEventOwner(eventId)) === sid)
    throw new HttpError(400, "You're the host — no need to request a spot at your own event.");
  const regs = await store.getRegistrations(sid);
  if (regs.going.includes(eventId)) throw new HttpError(400, "You're already going.");
  const already = regs.applied.includes(eventId);
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

export const DELETE = handler(async (req: Request, ctx: Ctx) => {
  const sid = await getSessionId();
  const eventId = pathId((await ctx.params).eventId, "eventId");
  rateLimit(req, "register", sid, LIMITS.register);
  await getStore().setApplied(sid, eventId, false);
  return noContent();
});
