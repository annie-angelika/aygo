// GET /api/events/by-code/:code → an event by its short share code

import { getStore } from "@/lib/server/store";
import { pathId } from "@/lib/server/validate";
import { handler, json, HttpError } from "@/lib/server/http";

export const GET = handler(
  async (_req: Request, ctx: { params: Promise<{ code: string }> }) => {
    const code = pathId((await ctx.params).code, "code");
    const event = await getStore().getEventByCode(code);
    if (!event) throw new HttpError(404, "Event not found");
    return json(event);
  },
);
