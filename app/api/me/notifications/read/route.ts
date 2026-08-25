// POST /api/me/notifications/read { ids? } → mark some (or all) notifications read.

import { getStore } from "@/lib/server/store";
import { getSessionId } from "@/lib/server/session";
import { expectObject, arrayOf, str, UUID } from "@/lib/server/validate";
import { handler, noContent, readJson } from "@/lib/server/http";

export const POST = handler(async (req: Request) => {
  const sid = await getSessionId();
  const body = expectObject(await readJson<unknown>(req).catch(() => ({})));
  const ids = body.ids == null ? undefined : arrayOf(body.ids, "ids", 100, (x) => str(x, "id", { max: 36, pattern: UUID }));
  await getStore().markNotificationsRead(sid, ids);
  return noContent();
});
