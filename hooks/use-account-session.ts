"use client";

// Keeps the server session in step with the Pollar login. On sign-in, the
// browser's session becomes the one that belongs to that account (restoring
// the account's events/RSVPs on this device); when the active session actually
// changes, every local-first cache is cleared and the page reloads so it
// re-hydrates from the right account. `signOut` does the reverse.

import { useEffect, useRef } from "react";
import { useAuth } from "@/hooks/use-auth";
import { accountKey, linkAccountSession, endAccountSession, USE_MOCK } from "@/lib/api";
import { clearAllStorage } from "@/lib/storage";

/** Identity that survives a name change: the provider id, else the email. */
function identityOf(profile: NonNullable<ReturnType<typeof useAuth>["profile"]>): string | null {
  const p = profile.providers;
  if (p?.google?.id) return `google:${p.google.id}`;
  if (p?.github?.id) return `github:${p.github.id}`;
  if (p?.wallet?.address) return `wallet:${p.wallet.address}`;
  if (profile.mail) return `email:${profile.mail}`;
  return null;
}

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

export function useAccountSession() {
  const auth = useAuth();
  const linked = useRef<string | null>(null);

  useEffect(() => {
    if (USE_MOCK || !auth.isAuthenticated || !auth.profile) return;
    const identity = identityOf(auth.profile);
    if (!identity || linked.current === identity) return;
    linked.current = identity;
    let cancelled = false;
    void (async () => {
      try {
        const key = await accountKey(identity);
        const { changed } = await linkAccountSession({
          account: key,
          name: auth.name,
          avatar: auth.avatar,
        });
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
  }, [auth.isAuthenticated, auth.profile, auth.name, auth.avatar]);
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
