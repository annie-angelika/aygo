"use client";

// Hydrates the local-first cache from the backend, once per full page load —
// after the server has said WHICH session this is (hooks/use-session-state),
// so caches filled from another session are dropped first, never pushed up.
// This closes the loop of the local-first model (see lib/api/README.md):
// writes go localStorage → background sync; this brings server state back
// down so a new browser (or a cleared one) sees the account's RSVPs, stamps,
// profile and preferences.
//
// Merge policy (no timestamps, so keep it predictable):
// - Registrations (going / applied / stamps): the SERVER is authoritative. The
//   host decides who is on the list (declines, removals), so a local row the
//   server no longer has is gone — it is never re-sent as if it were an
//   offline write. (That re-send used to put a declined guest back to
//   "Pending" and a removed guest back on the list.)
// - Profile / preferences: a local copy wins (it may hold unsynced edits) and
//   is pushed up when it differs; with no local copy, the server's is adopted.

import { useEffect } from "react";
import { STORAGE_KEYS, readStorage, writeStorage } from "@/lib/storage";
import {
  fetchRegistrations,
  fetchProfile,
  fetchPreferences,
  fetchMyEvents,
  saveProfile,
  savePreferences,
  type Registrations,
} from "@/lib/api";
import { loadSessionState } from "@/hooks/use-session-state";
import { replaceDrafts } from "@/lib/create-event";
import type { Preferences, ProfileEdits, Stamp } from "@/types";

let started = false; // module-level: one sync per page load, across mounts

const changed = (a: unknown, b: unknown) =>
  JSON.stringify(a) !== JSON.stringify(b);

/** Fire-and-forget push of a local-only row; a failure just retries next load. */
const push = (op: Promise<void>) =>
  void op.catch((e) => console.error("aygo sync push failed", e));

// Optimistic registration writes in flight (use-registrations): a refresh
// that landed between the local write and the server's answer would wipe the
// optimistic row, so a refresh waits for them first.
const writes = new Set<Promise<unknown>>();
export function trackRegistrationWrite<T>(op: Promise<T>): Promise<T> {
  writes.add(op);
  const done = () => writes.delete(op);
  // Both branches handled here: the caller owns the rejection, this chain
  // must never surface it as a second, unhandled one.
  op.then(done, done);
  return op;
}

/** Mirror the server's registrations into the local cache (server wins). */
export function applyRegistrations(server: Registrations): void {
  const going = readStorage<string[]>(STORAGE_KEYS.going, []);
  const applied = readStorage<string[]>(STORAGE_KEYS.applied, []);
  const stamps = readStorage<Stamp[]>(STORAGE_KEYS.stamps, []);

  // A stamped event is done — it never shows as going/applied again.
  const stamped = new Set(server.stamps.map((s) => s.eventId));
  const nextGoing = server.going.filter((id) => !stamped.has(id));
  const nextApplied = server.applied.filter((id) => !stamped.has(id));

  if (changed(going, nextGoing)) writeStorage(STORAGE_KEYS.going, nextGoing);
  if (changed(applied, nextApplied)) writeStorage(STORAGE_KEYS.applied, nextApplied);
  if (changed(stamps, server.stamps)) writeStorage(STORAGE_KEYS.stamps, server.stamps);
}

async function syncRegistrations(): Promise<void> {
  applyRegistrations(await fetchRegistrations());
}

/**
 * Re-read registrations from the server now — the event page and the tickets
 * list call this on mount and while visible, so a host's decision (approve,
 * decline, remove) shows up without a reload. Failures are silent (the cache
 * simply stays as it was).
 */
export async function refreshRegistrations(): Promise<void> {
  try {
    await loadSessionState();
    if (writes.size > 0) await Promise.allSettled([...writes]);
    applyRegistrations(await fetchRegistrations());
  } catch (e) {
    console.error("registrations refresh failed", e);
  }
}

async function syncProfile(): Promise<void> {
  const server = await fetchProfile();
  const local = readStorage<Partial<ProfileEdits>>(STORAGE_KEYS.profile, {});
  if (Object.keys(local).length === 0) {
    if (Object.keys(server).length > 0)
      writeStorage(STORAGE_KEYS.profile, server);
    return;
  }
  // The handle is server-owned (unique, set through its own endpoint): the
  // server's copy always wins — including its ABSENCE. A cached handle from a
  // previous account must not survive onto a session that has none, or the
  // mandatory "pick your username" dialog never shows.
  const { username: serverName, ...serverEdits } = server;
  const { username: _localName, ...localEdits } = local;
  void _localName;
  const merged = { ...localEdits, ...(serverName ? { username: serverName } : null) };
  if (changed(local, merged)) writeStorage(STORAGE_KEYS.profile, merged);
  if (changed(localEdits, serverEdits)) push(saveProfile(local as ProfileEdits));
}

async function syncPreferences(): Promise<void> {
  const server = await fetchPreferences();
  const local = readStorage<Preferences | null>(STORAGE_KEYS.preferences, null);
  if (!local) {
    if (server) writeStorage(STORAGE_KEYS.preferences, server);
  } else if (changed(local, server)) {
    push(savePreferences(local));
  }
}

/** The server's list of events you host is authoritative (it's what /manage
 * checks), so the local "Hosting" hint simply mirrors it. */
async function syncHostedEvents(): Promise<void> {
  replaceDrafts(await fetchMyEvents());
}

/** Mount once (see components/layout/server-sync.tsx). */
export function useServerSync(): void {
  useEffect(() => {
    if (started) return;
    started = true;
    void loadSessionState()
      .then(() =>
        Promise.allSettled([
          syncRegistrations(),
          syncProfile(),
          syncPreferences(),
          syncHostedEvents(),
        ]),
      )
      .then((results) => {
        for (const r of results)
          if (r.status === "rejected")
            console.error("aygo server sync failed", r.reason);
      });
  }, []);
}
