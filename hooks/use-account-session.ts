"use client";

// Proves the Pollar login to our server, once per login, and keeps the
// server's answer (hooks/use-session-state) current. On sign-in the browser
// PROVES the login (Pollar access token + a DPoP proof for Pollar's session
// check, signed with the SDK's per-session key), and the server makes this
// browser's session the one that belongs to that verified account —
// restoring its events, RSVPs, stamps and inbox on any device. When the
// active session actually changes, every local-first cache is cleared and
// the page reloads so it re-hydrates from the right account. A login already
// proven for this session (remembered per browser) is not re-proven on every
// page load. `signOutEverywhere` does the reverse.

import { useEffect, useRef, useState } from "react";
import { usePollar } from "@pollar/react";
import { buildProof, WebCryptoKeyManager, type AuthState } from "@pollar/core";

import { pollarMarker } from "@/hooks/use-auth";
import {
  adoptSession,
  loadSessionState,
  markLinked,
  patchSessionState,
  revalidateSession,
  useSessionState,
} from "@/hooks/use-session-state";
import { linkAccountSession, endAccountSession, NonceChallenge, ApiError } from "@/lib/api";
import { STORAGE_KEYS, clearAllStorage, writeStorage } from "@/lib/storage";

const POLLAR_KEY = process.env.NEXT_PUBLIC_POLLAR_PUBLISHABLE_KEY ?? "";
/**
 * Same default as `@pollar/core` 0.12 (`basePath` = `${baseUrl}/v3`). The
 * server relays the proof to exactly this URL (lib/server/pollar.ts), so the
 * API version here and the SDK's must move together.
 */
const RESUME_URL = `${(process.env.NEXT_PUBLIC_POLLAR_BASE_URL || "https://sdk.api.pollar.xyz").replace(/\/$/, "")}/v3/auth/session/resume`;

/** Wipe local-first caches and reload so hooks re-hydrate from the server. */
function restart(to?: string) {
  clearAllStorage();
  if (to) window.location.assign(to);
  else window.location.reload();
}

// If the server keeps answering `changed: true` for the same login (a browser
// that refuses the cookie), reloading forever would be worse than a stale
// session: allow one relink reload per login per tab session.
const RELOAD_GUARD = "aygo.relinked";
function mayReload(marker: string): boolean {
  try {
    if (sessionStorage.getItem(RELOAD_GUARD) === marker) return false;
    sessionStorage.setItem(RELOAD_GUARD, marker);
    return true;
  } catch {
    return true;
  }
}
function clearReloadGuard() {
  try {
    sessionStorage.removeItem(RELOAD_GUARD);
  } catch {
    /* noop */
  }
}

/**
 * The DPoP key is the SDK's per-session P-256 pair, persisted in IndexedDB
 * under the api-key hash — a second `WebCryptoKeyManager` for the same key
 * loads that exact pair, so proofs we build carry the thumbprint Pollar bound
 * the token to.
 *
 * The SDK replaces that pair whenever it clears a session (sign-out, a failed
 * refresh, an abandoned login), so the copy held here is dropped before every
 * use: a proof signed with the pair of an earlier login is refused by Pollar,
 * and would keep being refused until the page was reloaded.
 */
let keyManager: WebCryptoKeyManager | null = null;
function keys(): WebCryptoKeyManager {
  keyManager ??= new WebCryptoKeyManager(POLLAR_KEY);
  keyManager.resync();
  return keyManager;
}

/** Prove the current login to our server, honouring one nonce round-trip. */
async function link(accessToken: string): Promise<{ changed: boolean; fingerprint: string }> {
  const km = keys();
  await km.init();
  const proof = (nonce?: string) =>
    buildProof({ htm: "GET", htu: RESUME_URL, accessToken, nonce }, km);
  try {
    return await linkAccountSession({ accessToken, dpop: await proof() });
  } catch (e) {
    if (!(e instanceof NonceChallenge)) throw e;
    return linkAccountSession({ accessToken, dpop: await proof(e.nonce) });
  }
}

const MAX_LINK_ATTEMPTS = 3;
const RETRY_DELAY_MS = 4_000;
/**
 * Longest a login may sit unproven before the UI says so. Three attempts at
 * their full request budget fit inside it; anything slower is a stall (no
 * identity on the login, a request that never settles) and gets the same
 * "Sign-in failed · Retry" as a refused proof instead of an endless spinner.
 */
const LINK_DEADLINE_MS = 45_000;
const GENERIC_FAILURE = "We couldn't finish signing you in. Check your connection and retry.";

function describe(e: unknown): string {
  if (e instanceof ApiError && e.status < 500 && e.message) return e.message;
  return GENERIC_FAILURE;
}

export function useAccountSession() {
  const { getClient } = usePollar();
  const [pollar, setPollar] = useState<AuthState>(() => getClient().getAuthState());
  useEffect(() => getClient().onAuthStateChange(setPollar), [getClient]);
  const session = useSessionState();
  // WHO the Pollar login is, not the state object carrying it: the SDK emits
  // a new state for the same person several times (restored, then verified;
  // a token rotated in another tab; the wallet finishing set-up), and none of
  // those is a reason to start, restart or abandon a proof.
  const marker = pollarMarker(pollar, getClient().getUserProfile());
  /** The login this browser holds right now; a proof that settles for any other is stale. */
  const live = useRef<string | null>(null);
  const inflight = useRef<string | null>(null);
  const attempts = useRef(0);
  const retryTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  // Bumped to re-run the effect for a bounded retry: a link that fails
  // silently would leave the UI signed in as one person while the server
  // session still belongs to another (or to no one).
  const [retryTick, setRetryTick] = useState(0);
  useEffect(() => () => clearTimeout(retryTimer.current), []);

  // Ask the server who we are, once per page load — and again whenever the
  // tab comes back to the foreground (a sign-out or account switch in another
  // tab must not leave this one showing the old person).
  useEffect(() => {
    void loadSessionState();
    const onVisible = () => {
      if (document.visibilityState === "visible") void revalidateSession();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, []);

  // A manual retry from the UI starts the attempt budget over.
  useEffect(() => {
    attempts.current = 0;
  }, [session.retryTick]);

  useEffect(() => {
    live.current = marker;
    if (!POLLAR_KEY || !session.loaded || !marker) return;
    // Already proven for this very session: nothing to do (a refresh mints a
    // new token for the same person; the server would just answer "no change").
    if (session.account && session.linkedTo === marker) return;
    if (inflight.current === marker || session.linkError) return;
    inflight.current = marker;
    clearTimeout(retryTimer.current);
    patchSessionState({ linking: true, linkError: null });
    // The attempt outlives this effect run on purpose. Its outcome is applied
    // as long as the same person is still signed in to Pollar — it used to be
    // dropped whenever the effect re-ran mid-flight, which the SDK's second
    // "authenticated" emission on every page load did routinely: the server
    // had linked the account, the browser never recorded it, and the top bar
    // stayed on "Signing in…" until a reload.
    void (async () => {
      const client = getClient();
      try {
        // Read the token at the last moment: it may have been rotated since
        // this attempt was scheduled.
        const state = client.getAuthState();
        if (state.step !== "authenticated") return;
        const { changed, fingerprint } = await link(state.session.token.accessToken);
        if (live.current !== marker) return;
        attempts.current = 0;
        if (changed) {
          // Everything cached locally belongs to the previous session. Drop
          // it, remember the new session + login, and reload so every hook
          // re-hydrates from the right account.
          clearAllStorage();
          writeStorage(STORAGE_KEYS.owner, { fingerprint, account: true });
          writeStorage(STORAGE_KEYS.linked, marker);
          if (mayReload(marker)) {
            restart();
            return;
          }
        }
        adoptSession({ account: true, fingerprint });
        markLinked(marker);
        if (!changed) clearReloadGuard();
      } catch (e) {
        console.error("account link failed", e);
        if (live.current !== marker) return;
        if (attempts.current < MAX_LINK_ATTEMPTS - 1) {
          attempts.current += 1;
          // Refused: the token may simply have expired. Mint a fresh one for
          // the next attempt; if Pollar won't, it ends the session itself and
          // the Sign In button comes back.
          if (e instanceof ApiError && e.status === 401) await client.refresh().catch(() => {});
          retryTimer.current = setTimeout(() => setRetryTick((n) => n + 1), RETRY_DELAY_MS);
        } else {
          patchSessionState({ linking: false, linkError: describe(e) });
        }
      } finally {
        // Released last: the state patches above re-run this effect, and it
        // must still see the attempt as taken until they have landed.
        if (inflight.current === marker) inflight.current = null;
      }
    })();
  }, [
    marker,
    session.loaded,
    session.account,
    session.linkedTo,
    session.linkError,
    session.retryTick,
    retryTick,
    getClient,
  ]);

  // A login that stays unproven past the deadline is reported, never left
  // spinning. A proof that lands afterwards still clears the error.
  const pending =
    pollar.step === "authenticated" &&
    !(session.account && marker !== null && session.linkedTo === marker) &&
    !session.linkError;
  useEffect(() => {
    if (!POLLAR_KEY || !pending) return;
    const deadline = setTimeout(
      () => patchSessionState({ linking: false, linkError: GENERIC_FAILURE }),
      LINK_DEADLINE_MS,
    );
    return () => clearTimeout(deadline);
  }, [pending, session.retryTick]);
}

/** Sign out everywhere: Pollar, the server session, and every local cache.
 * Pollar's logout is awaited — otherwise its session could still be in
 * storage when the page reloads, and the next load would sign us back in. */
export async function signOutEverywhere(
  logout: () => Promise<unknown> | void,
): Promise<void> {
  const results = await Promise.allSettled([
    Promise.resolve(logout()),
    // The server session is the one that matters: give it a second try.
    endAccountSession().catch(() => endAccountSession()),
  ]);
  for (const r of results)
    if (r.status === "rejected") console.error("sign out step failed", r.reason);
  clearReloadGuard();
  patchSessionState({ account: false, linkedTo: null, linking: false, linkError: null });
  restart("/discover");
}
