// Host authorization: an event's manage surface belongs to the guest session
// that created it. Admins (supervision/support) pass too. Catalog events have
// no owner — they're managed from /admin only.

import "server-only";
import { getSessionId } from "@/lib/server/session";
import { hasAdminCookie } from "@/lib/server/admin";
import { getStore } from "@/lib/server/store";
import { HttpError } from "@/lib/server/http";

/** Throws 403 unless the current session created the event (or is an admin). */
export async function requireEventOwner(eventId: string): Promise<string> {
  const sid = await getSessionId();
  const owner = await getStore().getEventOwner(eventId);
  if (owner === sid) return sid;
  if (await hasAdminCookie()) return sid;
  throw new HttpError(403, "Only the event's host can do this");
}
