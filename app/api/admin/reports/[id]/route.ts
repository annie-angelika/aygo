// PATCH /api/admin/reports/:id  { status } → resolve or reopen an inbox item;
// the person who sent it is notified of the change.

import { getStore } from "@/lib/server/store";
import { requireAdmin } from "@/lib/server/admin";
import { notifyGuest, threadHref } from "@/lib/server/notify";
import { pathId } from "@/lib/server/validate";
import { handler, noContent, readJson, HttpError } from "@/lib/server/http";

export const PATCH = handler(
  async (req: Request, ctx: { params: Promise<{ id: string }> }) => {
    await requireAdmin(req);
    const id = pathId((await ctx.params).id);
    const { status } = await readJson<{ status?: string }>(req);
    if (status !== "open" && status !== "resolved")
      throw new HttpError(400, "status must be 'open' or 'resolved'");
    const store = getStore();
    const report = await store.getReport(id);
    const found = await store.setReportStatus(id, status);
    if (!report || !found) throw new HttpError(404, "Report not found");
    // The sender hears about it, same as when the host does it.
    if (report.status !== status) {
      const event = await store.getEvent(report.eventId);
      await notifyGuest(report.sid, report.eventId, {
        kind: "report_update",
        title: `Your ${report.kind} about ${event?.title ?? "an event"} was ${status === "resolved" ? "resolved" : "reopened"}`,
        body: "Open your inbox to see the thread.",
        href: threadHref(id),
      });
    }
    return noContent();
  },
);
