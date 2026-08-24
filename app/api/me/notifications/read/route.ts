// POST /api/me/notifications/read { ids? } → mark some (or all) notifications read.

import { getStore } from "@/lib/server/store";
import { getSessionId } from "@/lib/server/session";
import { handler, noContent, readJson } from "@/lib/server/http";

export const POST = handler(async (req: Request) => {
  const sid = await getSessionId();
  const body = await readJson<{ ids?: string[] }>(req).catch(() => ({}) as { ids?: string[] });
  const ids = Array.isArray(body.ids) ? body.ids.filter((i) => typeof i === "string") : undefined;
  await getStore().markNotificationsRead(sid, ids);
  return noContent();
});
