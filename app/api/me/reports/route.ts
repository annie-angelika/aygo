// GET /api/me/reports → the threads this guest opened (questions to hosts and
// reports), with every reply and the current status — the guest side of the
// host's inbox.

import { getStore } from "@/lib/server/store";
import { getSessionId } from "@/lib/server/session";
import { handler, json } from "@/lib/server/http";

export const GET = handler(async () => {
  const sid = await getSessionId();
  return json(await getStore().listMyReports(sid));
});
