// POST /api/events/:id/feedback  { kind, message } → file a question for the
// host or a report about the event. Questions land in the host's inbox (and
// notify them); reports go to the admin inbox. Either way the sender can follow
// the thread from /inbox. Returns { id }.

import { getStore } from "@/lib/server/store";
import { getSessionId } from "@/lib/server/session";
import { validateMessage } from "@/lib/server/validate-draft";
import { notifyHost, displayName, manageHref } from "@/lib/server/notify";
import { handler, json, readJson, HttpError } from "@/lib/server/http";
import type { FeedbackKind } from "@/types";

export const POST = handler(
  async (req: Request, ctx: { params: Promise<{ id: string }> }) => {
    const sid = await getSessionId();
    const { id } = await ctx.params;
    const { kind, message } = await readJson<{
      kind?: FeedbackKind;
      message?: string;
    }>(req);

    if (kind !== "question" && kind !== "report")
      throw new HttpError(400, "kind must be 'question' or 'report'");
    const text = validateMessage(message);

    const event = await getStore().getEvent(id);
    if (!event) throw new HttpError(404, "Event not found");

    const reportId = await getStore().addReport(sid, id, kind, text);
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
