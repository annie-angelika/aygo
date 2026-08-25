// POST /api/events/:id/feedback/:reportId/reply { message } → the host answers
// a question about their event. Owner (or admin) only. The guest who opened
// the thread is notified and can read it in /inbox.

import { getStore } from "@/lib/server/store";
import { requireEventOwner } from "@/lib/server/manage";
import { validateMessage } from "@/lib/server/validate-draft";
import { notifyGuest } from "@/lib/server/notify";
import { rateLimit, LIMITS } from "@/lib/server/rate-limit";
import { pathId, expectObject, UUID } from "@/lib/server/validate";
import { handler, noContent, readJson, HttpError } from "@/lib/server/http";

/** A thread is a conversation, not a chat log. */
export const MAX_REPLIES = 50;

export const POST = handler(
  async (req: Request, ctx: { params: Promise<{ id: string; reportId: string }> }) => {
    const { id: rawId, reportId } = await ctx.params;
    const id = pathId(rawId);
    if (!UUID.test(reportId)) throw new HttpError(400, "Invalid report id");
    const sid = await requireEventOwner(id);
    rateLimit(req, "reply", sid, LIMITS.reply);
    const store = getStore();
    const report = await store.getReport(reportId);
    if (!report || report.eventId !== id) throw new HttpError(404, "Report not found");
    if (report.kind === "report") throw new HttpError(400, "Reports are reviewed by the admins — you can resolve them, not reply.");
    const text = validateMessage(expectObject(await readJson<unknown>(req)).message);

    const thread = (await store.listReports()).find((r) => r.id === reportId);
    if ((thread?.replies.length ?? 0) >= MAX_REPLIES)
      throw new HttpError(429, "This thread is full — resolve it and start a new one if needed.");

    await store.addReply(reportId, "host", text);
    const event = await store.getEvent(id);
    await notifyGuest(report.sid, id, {
      kind: "reply",
      title: `${event?.host.name ?? "The host"} replied about ${event?.title ?? "your event"}`,
      body: text.length > 120 ? `${text.slice(0, 117)}…` : text,
      href: "/inbox",
    });
    return noContent();
  },
);
