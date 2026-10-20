"use client";

// The SERVER's word on who this browser is — the one source of truth for
// "signed in" across the app. The Pollar login is the proof presented at
// sign-in time (see hooks/use-account-session); afterwards the signed
// `aygo_session` cookie carries the account, so a lapsed Pollar token (its
// refresh failed, two tabs raced a rotation) no longer throws the person out
// of a session that is still perfectly valid on the server.
//
// It also guards the local-first caches: every session id has a fingerprint,
// and the caches remember which fingerprint they were filled from. When the
// server reports a different one — another account linked, cookies cleared,
// a sign-out in a second tab — the caches are dropped before anything reads
// them, so one person's name, photo or RSVPs never show up on another's
// account.

import { useSyncExternalStore } from "react";

import { fetchSessionState, type SessionState as ServerSession } from "@/lib/api";
import { STORAGE_KEYS, readStorage, writeStorage, clearAllStorage } from "@/lib/storage";

export type SessionState = {
  /** The server has answered at least once this page load. */
  loaded: boolean;
  /** This browser's session belongs to a verified account. */
  account: boolean;
  /** Fingerprint of the session id in force (null until known). */
  fingerprint: string | null;
  /** The Pollar login (user id / email) already proven for this session. */
  linkedTo: string | null;
  /** A Pollar login is being proven to the server right now. */
  linking: boolean;
  /** Proving the login failed after retries — shown with a retry. */
  linkError: string | null;
  /** Bumped by the UI to retry a failed link. */
  retryTick: number;
};

/** What the caches remember about their session (localStorage). */
type Owner = { fingerprint: string; account: boolean };

const SERVER_STATE: SessionState = {
  loaded: false,
  account: false,
  fingerprint: null,
  linkedTo: null,
  linking: false,
  linkError: null,
  retryTick: 0,
};

const listeners = new Set<() => void>();
function emit() {
  for (const l of listeners) l();
}

/** Optimistic first paint: what the last page load learned, until the server answers. */
function seeded(): SessionState {
  const owner = readStorage<Owner | null>(STORAGE_KEYS.owner, null);
  const linked = readStorage<string | null>(STORAGE_KEYS.linked, null);
  return owner
    ? { ...SERVER_STATE, account: owner.account, fingerprint: owner.fingerprint, linkedTo: linked }
    : SERVER_STATE;
}

let state: SessionState = typeof window === "undefined" ? SERVER_STATE : seeded();

export function patchSessionState(patch: Partial<SessionState>): void {
  state = { ...state, ...patch };
  emit();
}

export function getSessionState(): SessionState {
  return state;
}

/**
 * Record the session the server reports. Caches filled from a different
 * session are dropped first; the new fingerprint is remembered for next time.
 */
export function adoptSession(server: ServerSession): void {
  const prev = readStorage<Owner | null>(STORAGE_KEYS.owner, null);
  if (prev && prev.fingerprint !== server.fingerprint) clearAllStorage();
  writeStorage<Owner>(STORAGE_KEYS.owner, { fingerprint: server.fingerprint, account: server.account });
  patchSessionState({
    loaded: true,
    account: server.account,
    fingerprint: server.fingerprint,
    linkedTo: readStorage<string | null>(STORAGE_KEYS.linked, null),
  });
}

/** The Pollar login `marker` is now proven for this session (no need to re-prove it on the next load). */
export function markLinked(marker: string): void {
  writeStorage(STORAGE_KEYS.linked, marker);
  patchSessionState({ linkedTo: marker, linking: false, linkError: null });
}

/** The UI asked to try the link again after a failure. */
export function retrySessionLink(): void {
  patchSessionState({ linkError: null, retryTick: state.retryTick + 1 });
}

let loading: Promise<SessionState> | null = null;

/**
 * Ask the server once per page load (concurrent callers share the request).
 * On a network failure the optimistic snapshot stands — the person stays
 * where the last load left them rather than being flipped to signed-out.
 */
export function loadSessionState(): Promise<SessionState> {
  if (loading) return loading;
  loading = (async () => {
    try {
      adoptSession(await fetchSessionState());
    } catch (e) {
      console.error("session state unavailable", e);
      patchSessionState({ loaded: true });
    }
    return state;
  })();
  return loading;
}

/**
 * Re-check with the server (the tab came back to the foreground). A session
 * that changed underneath this tab — signed out or switched in another tab —
 * means every cache and hook here is someone else's: drop them and reload.
 */
export async function revalidateSession(): Promise<void> {
  if (!state.loaded) return;
  try {
    const server = await fetchSessionState();
    if (state.fingerprint && server.fingerprint !== state.fingerprint) {
      clearAllStorage();
      writeStorage<Owner>(STORAGE_KEYS.owner, { fingerprint: server.fingerprint, account: server.account });
      window.location.reload();
      return;
    }
    adoptSession(server);
  } catch {
    /* offline — keep what we have */
  }
}

export function useSessionState(): SessionState {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    () => state,
    () => SERVER_STATE,
  );
}
