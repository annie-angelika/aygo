// GET /api/me/notifications → the guest's in-app inbox, newest first, plus the
// unread count (drives the bell badge).

import { getStore } from "@/lib/server/store";
import { getSessionId } from "@/lib/server/session";
import { handler, json } from "@/lib/server/http";

export const GET = handler(async () => {
  const sid = await getSessionId();
  const store = getStore();
  const [items, unread] = await Promise.all([
    store.listNotifications(sid),
    store.countUnreadNotifications(sid),
  ]);
  return json({ items, unread });
});
