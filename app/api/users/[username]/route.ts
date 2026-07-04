// GET /api/users/:username → a public traveler profile

import { getStore } from "@/lib/server/store";
import { handler, json, HttpError } from "@/lib/server/http";

export const GET = handler(
  async (_req: Request, ctx: { params: Promise<{ username: string }> }) => {
    const { username } = await ctx.params;
    const traveler = await getStore().getTraveler(username);
    if (!traveler) throw new HttpError(404, "Traveler not found");
    return json(traveler);
  },
);
