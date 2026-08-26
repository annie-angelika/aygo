"use client";

// Keeps the server session in step with the Pollar login. On sign-in the
// browser PROVES the login to our server (Pollar access token + a DPoP proof
// for Pollar's session check, signed with the SDK's per-session key), and the
// server makes this browser's session the one that belongs to that verified
// account — restoring its events, RSVPs, stamps and inbox on any device. When
// the active session actually changes, every local-first cache is cleared and
// the page reloads so it re-hydrates from the right account. `signOut` does
// the reverse.

import { useEffect, useRef } from "react";
import { usePollar } from "@pollar/react";
import { buildProof, WebCryptoKeyManager } from "@pollar/core";

import { useAuth } from "@/hooks/use-auth";
import { linkAccountSession, endAccountSession, NonceChallenge } from "@/lib/api";
import { clearAllStorage } from "@/lib/storage";

const POLLAR_KEY = process.env.NEXT_PUBLIC_POLLAR_PUBLISHABLE_KEY ?? "";
/** Same default as `@pollar/core` and lib/server/pollar.ts (`basePath` = `${baseUrl}/v1`). */
const RESUME_URL = `${(process.env.NEXT_PUBLIC_POLLAR_BASE_URL || "https://sdk.api.pollar.xyz").replace(/\/$/, "")}/v1/auth/session/resume`;

/** Wipe local-first caches and reload so hooks re-hydrate from the server. */
function restart(to?: string) {
  clearAllStorage();
  if (to) window.location.assign(to);
  else window.location.reload();
}

// If the server keeps answering `changed: true` (a browser that refuses the
// cookie), reloading forever would be worse than a stale session: allow one
// relink reload per tab session.
const RELOAD_GUARD = "aygo.relinked";
function mayReload(): boolean {
  try {
    if (sessionStorage.getItem(RELOAD_GUARD)) return false;
    sessionStorage.setItem(RELOAD_GUARD, "1");
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
 * the token to. Created lazily, once.
 */
let keyManager: WebCryptoKeyManager | null = null;
function keys(): WebCryptoKeyManager {
  return (keyManager ??= new WebCryptoKeyManager(POLLAR_KEY));
}

/** Prove the current login to our server, honouring one nonce round-trip. */
async function link(accessToken: string): Promise<{ changed: boolean }> {
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

export function useAccountSession() {
  const auth = useAuth();
  const { getClient } = usePollar();
  const linked = useRef<string | null>(null);

  useEffect(() => {
    if (!POLLAR_KEY || !auth.isAuthenticated || !auth.profile) return;
    const state = getClient().getAuthState();
    if (state.step !== "authenticated") return;
    const { accessToken } = state.session.token;
    // One link per sign-in: re-run only when the token identity changes (a
    // refresh mints a new token for the same person; the server dedupes).
    const marker = state.session.userId ?? auth.profile.mail;
    if (!accessToken || !marker || linked.current === marker) return;
    linked.current = marker;
    let cancelled = false;
    void (async () => {
      try {
        const { changed } = await link(accessToken);
        if (changed && !cancelled && mayReload()) restart();
        if (!changed) clearReloadGuard();
      } catch (e) {
        console.error("account link failed", e);
        linked.current = null;
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [auth.isAuthenticated, auth.profile, getClient]);
}

/** Sign out everywhere: Pollar, the server session, and every local cache.
 * Pollar's logout is awaited — otherwise its session could still be in
 * storage when the page reloads, and the next load would sign us back in. */
export async function signOutEverywhere(
  logout: () => Promise<unknown> | void,
): Promise<void> {
  const results = await Promise.allSettled([
    Promise.resolve(logout()),
    endAccountSession(),
  ]);
  for (const r of results)
    if (r.status === "rejected") console.error("sign out step failed", r.reason);
  clearReloadGuard();
  restart("/discover");
}
