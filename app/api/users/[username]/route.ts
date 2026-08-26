// GET /api/users/:username → the public profile behind /u/<username>: identity,
// collection and public hosted events. Only what the person chose to show —
// never their email, session or private events.

import { getStore } from "@/lib/server/store";
import { normalizeUsername, usernameProblem } from "@/lib/username";
import { handler, json, HttpError } from "@/lib/server/http";

export const GET = handler(
  async (_req: Request, ctx: { params: Promise<{ username: string }> }) => {
    const username = normalizeUsername((await ctx.params).username);
    if (usernameProblem(username)) throw new HttpError(404, "Profile not found");
    const profile = await getStore().getPublicProfile(username);
    if (!profile) throw new HttpError(404, "Profile not found");
    return json(profile);
  },
);
