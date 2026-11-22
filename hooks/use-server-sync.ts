"use client";

// Hydrates the local-first cache from the backend, once per full page load —
// after the server has said WHICH session this is (hooks/use-session-state),
// so caches filled from another session are dropped first, never pushed up.
// This closes the loop of the local-first model (see lib/api/README.md):
// writes go localStorage → background sync; this brings server state back
// down so a new browser (or a cleared one) sees the account's RSVPs, stamps,
// profile and preferences.
//
// Merge policy (no timestamps, so keep it predictable) — the SERVER is the
// source of truth for everything an account owns:
// - Registrations (going / applied / stamps): the host decides who is on the
//   list (declines, removals), so a local row the server no longer has is
//   gone — it is never re-sent as if it were an offline write. (That re-send
//   used to put a declined guest back to "Pending" and a removed guest back
//   on the list.)
// - Profile / preferences: the server's copy replaces the local one, so what
//   you saved on one device is what every other device shows. The local copy
//   is pushed up only when it holds an edit the server never accepted
//   (lib/unsynced — a save that failed offline) or the server has nothing
//   yet. A device's merely OLD copy is never pushed: that is what erased a
//   bio saved on the PC as soon as the phone loaded (QA AY-18 / AY-26).

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
import { editedSince, isUnsynced, pushLocalEdit } from "@/lib/unsynced";
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
  const paid = readStorage<string[]>(STORAGE_KEYS.paid, []);
  const stamps = readStorage<Stamp[]>(STORAGE_KEYS.stamps, []);

  // A stamped event is done — it never shows as going/applied again.
  const stamped = new Set(server.stamps.map((s) => s.eventId));
  const nextGoing = server.going.filter((id) => !stamped.has(id));
  const nextApplied = server.applied.filter((id) => !stamped.has(id));

  if (changed(going, nextGoing)) writeStorage(STORAGE_KEYS.going, nextGoing);
  if (changed(paid, server.paid ?? [])) writeStorage(STORAGE_KEYS.paid, server.paid ?? []);
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
  const startedAt = Date.now();
  const server = await fetchProfile();
  // Saved on this page while the request was in flight: that write is newer
  // than what we just read, and its own push is already on the way.
  if (editedSince("profile", startedAt)) return;
  const local = readStorage<Partial<ProfileEdits>>(STORAGE_KEYS.profile, {});
  // The handle is server-owned (unique, set through its own endpoint): the
  // server's copy always wins — including its ABSENCE. A cached handle from a
  // previous account must not survive onto a session that has none, or the
  // mandatory "pick your username" dialog never shows.
  const { username: serverName, ...serverEdits } = server;
  const { username: _localName, ...localEdits } = local;
  void _localName;
  const hasLocal = Object.keys(localEdits).length > 0;
  const hasServer = Object.keys(serverEdits).length > 0;

  if (hasLocal && (isUnsynced("profile") || !hasServer)) {
    const merged = { ...localEdits, ...(serverName ? { username: serverName } : null) };
    if (changed(local, merged)) writeStorage(STORAGE_KEYS.profile, merged);
    if (changed(localEdits, serverEdits))
      push(pushLocalEdit("profile", () => saveProfile(merged as ProfileEdits)));
    return;
  }
  if (changed(local, server)) writeStorage(STORAGE_KEYS.profile, server);
}

async function syncPreferences(): Promise<void> {
  const startedAt = Date.now();
  const server = await fetchPreferences();
  if (editedSince("preferences", startedAt)) return;
  const local = readStorage<Preferences | null>(STORAGE_KEYS.preferences, null);
  if (local && (isUnsynced("preferences") || !server)) {
    if (changed(local, server ?? {}))
      push(pushLocalEdit("preferences", () => savePreferences(local)));
    return;
  }
  if (server && changed(local, server)) writeStorage(STORAGE_KEYS.preferences, server);
}

/**
 * Re-read profile + preferences from the server — the tab came back to the
 * foreground, and they may have been edited on another device meanwhile.
 * At most once a minute; failures are silent (the cache stays as it was).
 */
let lastAccountRefresh = 0;
export async function refreshAccountData(): Promise<void> {
  const now = Date.now();
  if (!started || now - lastAccountRefresh < 60_000) return;
  lastAccountRefresh = now;
  try {
    await loadSessionState();
    await Promise.allSettled([syncProfile(), syncPreferences()]);
  } catch (e) {
    console.error("account refresh failed", e);
  }
}

/** The server's list of events you host is authoritative (it's what /manage
 * checks), so the local "Hosting" hint simply mirrors it. */
async function syncHostedEvents(): Promise<void> {
  replaceDrafts(await fetchMyEvents());
}

/** Mount once (see components/layout/server-sync.tsx). */
export function useServerSync(): void {
  // Another device may have edited the account while this tab sat in the
  // background: pick the changes up when it comes back.
  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === "visible") void refreshAccountData();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, []);

  useEffect(() => {
    if (started) return;
    started = true;
    lastAccountRefresh = Date.now();
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
