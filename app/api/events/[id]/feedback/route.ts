// POST /api/events/:id/feedback  { kind, message } → file a question for the
// host or a report about the event. Questions land in the host's inbox (and
// notify them); reports go to the admin inbox. Either way the sender can follow
// the thread from /inbox. Returns { id }.
//
// Anti-abuse: rate limited, a daily cap, at most 3 open threads per event per
// guest, no duplicate messages, and hosts can't message themselves.

import { getStore } from "@/lib/server/store";
import { getSessionId } from "@/lib/server/session";
import { validateMessage } from "@/lib/server/validate-draft";
import { notifyHost, displayName, manageHref } from "@/lib/server/notify";
import { rateLimit, LIMITS } from "@/lib/server/rate-limit";
import { pathId, expectObject, enumOf, dedupeKey } from "@/lib/server/validate";
import { handler, json, readJson, HttpError } from "@/lib/server/http";

const MAX_PER_DAY = 20;
const MAX_OPEN_PER_EVENT = 3;

export const POST = handler(
  async (req: Request, ctx: { params: Promise<{ id: string }> }) => {
    const sid = await getSessionId();
    const id = pathId((await ctx.params).id);
    rateLimit(req, "feedback", sid, LIMITS.feedback);
    const body = expectObject(await readJson<unknown>(req));
    const kind = enumOf(body.kind, "kind", ["question", "report"] as const);
    const text = validateMessage(body.message);

    const store = getStore();
    const event = await store.getEvent(id);
    if (!event) throw new HttpError(404, "Event not found");
    if (kind === "question" && (await store.getEventOwner(id)) === sid)
      throw new HttpError(400, "That's your own event.");

    if ((await store.countRecentReports(sid, 86_400_000)) >= MAX_PER_DAY)
      throw new HttpError(429, "You've sent a lot of messages today — try again tomorrow.");
    const mine = (await store.listMyReports(sid)).filter((r) => r.eventId === id);
    if (mine.filter((r) => r.status === "open" && r.kind === kind).length >= MAX_OPEN_PER_EVENT)
      throw new HttpError(429, `You already have ${MAX_OPEN_PER_EVENT} open ${kind}s about this event — add to one of them from your inbox.`);
    const key = dedupeKey(text);
    if (mine.some((r) => dedupeKey(r.message) === key))
      throw new HttpError(409, "You already sent this exact message.");

    const reportId = await store.addReport(sid, id, kind, text);
    if (kind === "question") {
      await notifyHost(id, {
        kind: "question",
        title: `${await displayName(sid)} has a question about ${event.title}`,
        body: text.length > 120 ? `${text.slice(0, 117)}…` : text,
        href: manageHref(id, "inbox"),
      });
    }
    return json({ id: reportId }, 201);
  },
);
