// POST /api/me/reports/:id/reply { message } → the guest follows up in their
// own thread. The host hears about it in their inbox.

import { getStore } from "@/lib/server/store";
import { getSessionId } from "@/lib/server/session";
import { validateMessage } from "@/lib/server/validate-draft";
import { notifyHost, displayName, manageHref } from "@/lib/server/notify";
import { handler, noContent, readJson, HttpError } from "@/lib/server/http";

export const POST = handler(
  async (req: Request, ctx: { params: Promise<{ id: string }> }) => {
    const sid = await getSessionId();
    const { id } = await ctx.params;
    const report = await getStore().getReport(id);
    if (!report || report.sid !== sid) throw new HttpError(404, "Thread not found");
    const { message } = await readJson<{ message?: string }>(req);
    const text = validateMessage(message);

    await getStore().addReply(id, "guest", text);
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
