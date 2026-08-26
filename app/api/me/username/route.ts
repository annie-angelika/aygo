// PUT /api/me/username { username } → claim (or change) the session's public
// handle. Validated + normalized server-side (lib/server/username.ts), unique
// across the app (409 when taken). Every account picks one right after its
// first sign-in (components/onboarding/username-gate).

import { getStore } from "@/lib/server/store";
import { getSessionId } from "@/lib/server/session";
import { rateLimit, LIMITS } from "@/lib/server/rate-limit";
import { validateUsername } from "@/lib/server/username";
import { expectObject } from "@/lib/server/validate";
import { handler, json, readJson, HttpError } from "@/lib/server/http";

export const PUT = handler(async (req: Request) => {
  const sid = await getSessionId();
  rateLimit(req, "profile", sid, LIMITS.profile);
  const username = validateUsername(expectObject(await readJson<unknown>(req)).username);
  const result = await getStore().setUsername(sid, username);
  if (result === "taken") throw new HttpError(409, "That username is already taken.");
  return json({ username });
});
