// GET /api/me/notifications → the guest's in-app inbox, newest first, plus the
// unread count (drives the bell badge).

import { getStore } from "@/lib/server/store";
import { getSessionId } from "@/lib/server/session";
import { handler, json } from "@/lib/server/http";

export const GET = handler(async () => {
  const sid = await getSessionId();
  const items = await getStore().listNotifications(sid);
  return json({ items, unread: items.filter((n) => !n.read).length });
});
