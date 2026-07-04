// GET /api/me/preferences → the guest's saved preferences (or null if none)
// PUT /api/me/preferences → persist them

import { getStore } from "@/lib/server/store";
import { getSessionId } from "@/lib/server/session";
import { handler, json, noContent, readJson } from "@/lib/server/http";
import type { Preferences } from "@/types";

export const GET = handler(async () => {
  const sid = await getSessionId();
  return json(await getStore().getPreferences(sid));
});

export const PUT = handler(async (req: Request) => {
  const sid = await getSessionId();
  const prefs = await readJson<Preferences>(req);
  await getStore().savePreferences(sid, prefs);
  return noContent();
});
