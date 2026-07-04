// GET /api/events/by-code/:code → an event by its short share code

import { getStore } from "@/lib/server/store";
import { handler, json, HttpError } from "@/lib/server/http";

export const GET = handler(
  async (_req: Request, ctx: { params: Promise<{ code: string }> }) => {
    const { code } = await ctx.params;
    const event = await getStore().getEventByCode(code);
    if (!event) throw new HttpError(404, "Event not found");
    return json(event);
  },
);
