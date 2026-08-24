// POST /api/events/:id/feedback/:reportId/reply { message } → the host answers
// a question (or a report) about their event. Owner (or admin) only. The guest
// who opened the thread is notified and can read it in /inbox.

import { getStore } from "@/lib/server/store";
import { requireEventOwner } from "@/lib/server/manage";
import { validateMessage } from "@/lib/server/validate-draft";
import { notifyGuest } from "@/lib/server/notify";
import { handler, noContent, readJson, HttpError } from "@/lib/server/http";

export const POST = handler(
  async (
    req: Request,
    ctx: { params: Promise<{ id: string; reportId: string }> },
  ) => {
    const { id, reportId } = await ctx.params;
    await requireEventOwner(id);
    const report = await getStore().getReport(reportId);
    if (!report || report.eventId !== id) throw new HttpError(404, "Report not found");
    const { message } = await readJson<{ message?: string }>(req);
    const text = validateMessage(message);

    await getStore().addReply(reportId, "host", text);
    const event = await getStore().getEvent(id);
    await notifyGuest(report.sid, id, {
      kind: "reply",
      title: `${event?.host.name ?? "The host"} replied about ${event?.title ?? "your event"}`,
      body: text.length > 120 ? `${text.slice(0, 117)}…` : text,
      href: "/inbox",
    });
    return noContent();
  },
);
