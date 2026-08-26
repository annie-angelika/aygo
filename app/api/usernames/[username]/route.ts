// GET /api/usernames/:username → { available, username } — live availability
// for the picker. The same rules as claiming apply, so an invalid handle is a
// 400 with the reason, and "available" for a valid one means nobody else
// holds it (your own current handle counts as available to you).

import { getStore } from "@/lib/server/store";
import { getSessionId } from "@/lib/server/session";
import { rateLimit, LIMITS } from "@/lib/server/rate-limit";
import { validateUsername } from "@/lib/server/username";
import { handler, json } from "@/lib/server/http";

export const GET = handler(
  async (req: Request, ctx: { params: Promise<{ username: string }> }) => {
    rateLimit(req, "username:check", null, LIMITS.usernameCheck);
    const username = validateUsername((await ctx.params).username);
    const [holder, sid] = await Promise.all([
      getStore().getPublicProfile(username),
      getSessionId(),
    ]);
    const mine = (await getStore().getProfile(sid)).username === username;
    return json({ username, available: holder === null || mine });
  },
);
