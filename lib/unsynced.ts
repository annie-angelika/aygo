// Which local-first caches hold an edit the server has not accepted yet.
//
// Profile and preferences are written to localStorage first and pushed to the
// backend right after. The flag set here is what lets the load-time sync
// (hooks/use-server-sync) tell "this device has a newer edit to push" from
// "this device's copy is simply old" — without it, an old copy on a second
// device overwrote what the first device had just saved (QA AY-18 / AY-26:
// bio, location and interests saved on the PC vanished on the phone and on
// the public profile).

import { ApiError } from "@/lib/api/client";
import { STORAGE_KEYS, readStorage, writeStorage } from "@/lib/storage";

export type SyncedCache = "profile" | "preferences";
type Flags = Partial<Record<SyncedCache, true>>;

/** When each cache was last written by the person on THIS page (ms). */
const lastLocalWrite: Partial<Record<SyncedCache, number>> = {};

export function isUnsynced(what: SyncedCache): boolean {
  return readStorage<Flags>(STORAGE_KEYS.unsynced, {})[what] === true;
}

function setUnsynced(what: SyncedCache, on: boolean): void {
  const flags = { ...readStorage<Flags>(STORAGE_KEYS.unsynced, {}) };
  if (on) flags[what] = true;
  else delete flags[what];
  writeStorage(STORAGE_KEYS.unsynced, flags);
}

/** Has the person edited this cache on this page since `since` (ms)? */
export function editedSince(what: SyncedCache, since: number): boolean {
  return (lastLocalWrite[what] ?? 0) >= since;
}

/**
 * Run the push for a local edit. The cache counts as unsynced until the
 * server accepts it; a network failure leaves the flag up so the next page
 * load retries, while an outright refusal (4xx: validation, moderation) drops
 * it — that edit will never be accepted, so the server's copy is the truth
 * again. Rejections still reach the caller.
 */
export async function pushLocalEdit(what: SyncedCache, op: () => Promise<void>): Promise<void> {
  const at = Date.now();
  lastLocalWrite[what] = at;
  setUnsynced(what, true);
  try {
    await op();
  } catch (e) {
    if (e instanceof ApiError && e.status >= 400 && e.status < 500 && lastLocalWrite[what] === at)
      setUnsynced(what, false);
    throw e;
  }
  // A newer edit may have started meanwhile — its own push clears the flag.
  if (lastLocalWrite[what] === at) setUnsynced(what, false);
}
