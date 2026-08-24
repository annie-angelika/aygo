// PATCH /api/events/:id/feedback/:reportId  { status } → the host resolves or
// reopens a question/report about their own event. Owner (or admin) only. The
// sender is told about the change.

import { getStore } from "@/lib/server/store";
import { requireEventOwner } from "@/lib/server/manage";
import { notifyGuest } from "@/lib/server/notify";
import { handler, noContent, readJson, HttpError } from "@/lib/server/http";

export const PATCH = handler(
  async (
    req: Request,
    ctx: { params: Promise<{ id: string; reportId: string }> },
  ) => {
    const { id, reportId } = await ctx.params;
    await requireEventOwner(id);
    const { status } = await readJson<{ status?: string }>(req);
    if (status !== "open" && status !== "resolved")
      throw new HttpError(400, "status must be 'open' or 'resolved'");

    // The report must belong to this event — a host can't touch other inboxes.
    const report = await getStore().getReport(reportId);
    if (!report || report.eventId !== id) throw new HttpError(404, "Report not found");

    await getStore().setReportStatus(reportId, status);
    if (report.status !== status) {
      const event = await getStore().getEvent(id);
      await notifyGuest(report.sid, id, {
        kind: "report_update",
        title:
          status === "resolved"
            ? `Your ${report.kind} about ${event?.title ?? "an event"} was resolved`
            : `Your ${report.kind} about ${event?.title ?? "an event"} was reopened`,
        body: "Open your inbox to see the thread.",
        href: "/inbox",
      });
    }
    return noContent();
  },
);
