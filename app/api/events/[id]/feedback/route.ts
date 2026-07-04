// POST /api/events/:id/feedback  { kind, message } → file a question for the
// host or a report about the event. Lands in the admin inbox.

import { getStore } from "@/lib/server/store";
import { getSessionId } from "@/lib/server/session";
import { handler, noContent, readJson, HttpError } from "@/lib/server/http";
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
    const text = message?.trim();
    if (!text) throw new HttpError(400, "message is required");
    if (text.length > 2000) throw new HttpError(400, "message is too long");

    const event = await getStore().getEvent(id);
    if (!event) throw new HttpError(404, "Event not found");

    await getStore().addReport(sid, id, kind, text);
    return noContent();
  },
);
