// GET /api/me/profile → the guest's saved profile edits
// PUT /api/me/profile → persist them

import { getStore } from "@/lib/server/store";
import { getSessionId } from "@/lib/server/session";
import { handler, json, noContent, readJson } from "@/lib/server/http";
import type { ProfileEdits } from "@/types";

export const GET = handler(async () => {
  const sid = await getSessionId();
  return json(await getStore().getProfile(sid));
});

export const PUT = handler(async (req: Request) => {
  const sid = await getSessionId();
  const edits = await readJson<ProfileEdits>(req);
  await getStore().saveProfile(sid, edits);
  return noContent();
});
