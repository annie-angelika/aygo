// GET /api/users/:username → a public traveler profile

import { getStore } from "@/lib/server/store";
import { pathId } from "@/lib/server/validate";
import { handler, json, HttpError } from "@/lib/server/http";

export const GET = handler(
  async (_req: Request, ctx: { params: Promise<{ username: string }> }) => {
    const username = pathId((await ctx.params).username, "username");
    const traveler = await getStore().getTraveler(username);
    if (!traveler) throw new HttpError(404, "Traveler not found");
    return json(traveler);
  },
);
