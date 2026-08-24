"use client";

// Hydrates the local-first cache from the backend, once per full page load.
// This closes the loop of the local-first model (see lib/api/README.md): writes
// go localStorage → background sync; this brings server state back down so a
// new browser (or a cleared one) sees the account's RSVPs, stamps, profile and
// preferences.
//
// Merge policy (no timestamps, so keep it predictable):
// - Lists (going / applied / stamps): union. Server rows are adopted locally;
//   local-only rows are treated as unsynced offline writes and pushed up.
// - Profile / preferences: a local copy wins (it may hold unsynced edits) and
//   is pushed up when it differs; with no local copy, the server's is adopted.

import { useEffect } from "react";
import { STORAGE_KEYS, readStorage, writeStorage } from "@/lib/storage";
import {
  USE_MOCK,
  fetchRegistrations,
  fetchProfile,
  fetchPreferences,
  fetchMyEvents,
  rsvp,
  applyToEvent,
  collectStamp,
  saveProfile,
  savePreferences,
} from "@/lib/api";
import { replaceDrafts } from "@/lib/create-event";
import type { Preferences, ProfileEdits, Stamp } from "@/types";

let started = false; // module-level: one sync per page load, across mounts

const changed = (a: unknown, b: unknown) =>
  JSON.stringify(a) !== JSON.stringify(b);

/** Fire-and-forget push of a local-only row; a failure just retries next load. */
const push = (op: Promise<void>) =>
  void op.catch((e) => console.error("aygo sync push failed", e));

async function syncRegistrations(): Promise<void> {
  const server = await fetchRegistrations();
  if (!server) return;

  const going = readStorage<string[]>(STORAGE_KEYS.going, []);
  const applied = readStorage<string[]>(STORAGE_KEYS.applied, []);
  const stamps = readStorage<Stamp[]>(STORAGE_KEYS.stamps, []);

  const mergedGoing = [...new Set([...server.going, ...going])];
  const mergedApplied = [...new Set([...server.applied, ...applied])];
  const seen = new Set(server.stamps.map((s) => s.eventId));
  const localOnlyStamps = stamps.filter((s) => !seen.has(s.eventId));
  const mergedStamps = [...server.stamps, ...localOnlyStamps];

  // A stamped event is done — it never re-enters going/applied via the merge.
  const stamped = new Set(mergedStamps.map((s) => s.eventId));
  const finalGoing = mergedGoing.filter((id) => !stamped.has(id));
  const finalApplied = mergedApplied.filter((id) => !stamped.has(id));

  if (changed(going, finalGoing)) writeStorage(STORAGE_KEYS.going, finalGoing);
  if (changed(applied, finalApplied))
    writeStorage(STORAGE_KEYS.applied, finalApplied);
  if (changed(stamps, mergedStamps))
    writeStorage(STORAGE_KEYS.stamps, mergedStamps);

  for (const id of finalGoing.filter((id) => !server.going.includes(id)))
    push(rsvp(id));
  for (const id of finalApplied.filter((id) => !server.applied.includes(id)))
    push(applyToEvent(id));
  for (const s of localOnlyStamps) push(collectStamp(s.eventId));
}

async function syncProfile(): Promise<void> {
  const server = await fetchProfile();
  if (!server) return;
  const local = readStorage<Partial<ProfileEdits>>(STORAGE_KEYS.profile, {});
  if (Object.keys(local).length === 0) {
    if (Object.keys(server).length > 0)
      writeStorage(STORAGE_KEYS.profile, server);
  } else if (changed(local, server)) {
    push(saveProfile(local as ProfileEdits));
  }
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
  const server = await fetchMyEvents();
  if (server) replaceDrafts(server);
}

/** Mount once (see components/layout/server-sync.tsx). No-op in mock mode. */
export function useServerSync(): void {
  useEffect(() => {
    if (USE_MOCK || started) return;
    started = true;
    void Promise.allSettled([
      syncRegistrations(),
      syncProfile(),
      syncPreferences(),
      syncHostedEvents(),
    ]).then((results) => {
      for (const r of results)
        if (r.status === "rejected")
          console.error("aygo server sync failed", r.reason);
    });
  }, []);
}
