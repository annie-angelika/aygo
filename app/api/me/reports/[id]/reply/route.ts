// POST /api/me/reports/:id/reply { message } → the guest follows up in their
// own thread. The host hears about it in their inbox.

import { getStore } from "@/lib/server/store";
import { getSessionId } from "@/lib/server/session";
import { validateMessage } from "@/lib/server/validate-draft";
import { notifyHost, displayName, manageHref } from "@/lib/server/notify";
import { rateLimit, LIMITS } from "@/lib/server/rate-limit";
import { expectObject, UUID } from "@/lib/server/validate";
import { handler, noContent, readJson, HttpError } from "@/lib/server/http";

const MAX_REPLIES = 50;

export const POST = handler(
  async (req: Request, ctx: { params: Promise<{ id: string }> }) => {
    const sid = await getSessionId();
    const { id } = await ctx.params;
    if (!UUID.test(id)) throw new HttpError(400, "Invalid thread id");
    rateLimit(req, "reply", sid, LIMITS.reply);
    const store = getStore();
    const report = await store.getReport(id);
    if (!report || report.sid !== sid) throw new HttpError(404, "Thread not found");
    const text = validateMessage(expectObject(await readJson<unknown>(req)).message);
    const thread = (await store.listMyReports(sid)).find((r) => r.id === id);
    if ((thread?.replies.length ?? 0) >= MAX_REPLIES)
      throw new HttpError(429, "This thread is full — start a new one from the event page.");

    await store.addReply(id, "guest", text);
    if (report.kind === "question") {
      await notifyHost(report.eventId, {
        kind: "reply",
        title: `${await displayName(sid)} replied`,
        body: text.length > 120 ? `${text.slice(0, 117)}…` : text,
        href: manageHref(report.eventId, "inbox"),
      });
    }
    return noContent();
  },
);
