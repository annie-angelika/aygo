// PATCH /api/events/:id/feedback/:reportId  { status } → the host resolves or
// reopens a question/report about their own event. Owner (or admin) only.

import { getStore } from "@/lib/server/store";
import { requireEventOwner } from "@/lib/server/manage";
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
    const reports = await getStore().listReports();
    const report = reports.find((r) => r.id === reportId && r.eventId === id);
    if (!report) throw new HttpError(404, "Report not found");

    await getStore().setReportStatus(reportId, status);
    return noContent();
  },
);
