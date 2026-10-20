"use client";

import { useEffect, useState } from "react";
import { usePollar } from "@pollar/react";
import type { AuthState, PollarUserProfile } from "@pollar/core";

import { openLogin } from "@/components/auth/login-modal-store";
import { useSessionState, retrySessionLink } from "@/hooks/use-session-state";

/**
 * The single source of truth for "is someone signed in" across the app.
 *
 * Signed in means the SERVER session belongs to an account (see
 * hooks/use-session-state) — Pollar is the proof presented at sign-in, not
 * the session itself. A Pollar login that this session hasn't proven yet (or
 * that belongs to a different person than the one proven) is `linking`, not
 * signed in: the UI never shows one account's data under another's login,
 * and a login whose proof failed says so (`linkError`) instead of quietly
 * passing an anonymous session off as the account.
 *
 * `profile` carries the Pollar identity (name / email / avatar) when its
 * session is live, so screens like the register sheet can prefill; it's held
 * in memory by the SDK (never persisted), so we subscribe to auth-state
 * changes to keep it reactive after login / logout / resume.
 */
export function useAuth() {
  const { isAuthenticated: pollarAuthed, login, logout, getClient } = usePollar();
  // Seed from whatever the client already holds (e.g. a resumed session), then
  // keep it in sync from the auth-state subscription. Updating state only from
  // the subscription callback keeps setState out of the effect body.
  const [profile, setProfile] = useState<PollarUserProfile | null>(() =>
    getClient().getUserProfile(),
  );

  useEffect(() => {
    const client = getClient();
    return client.onAuthStateChange(() => setProfile(client.getUserProfile()));
  }, [getClient]);

  const session = useSessionState();
  const marker = pollarMarker(getClient().getAuthState(), profile);
  // A live Pollar login counts only once it is the one proven for this session.
  const linked = !pollarAuthed || (marker !== null && session.linkedTo === marker);
  const isAuthenticated = session.account && linked;
  const linking = pollarAuthed && !isAuthenticated && !session.linkError;

  const name = profile
    ? `${profile.first_name} ${profile.last_name}`.trim()
    : null;

  return {
    isAuthenticated,
    /** A Pollar login is being proven to the server (a few seconds after sign-in). */
    linking,
    /** Proving the login failed; `retryLink` tries again. */
    linkError: session.linkError,
    retryLink: retrySessionLink,
    profile,
    /** Display name from the social provider, or null when signed out. */
    name: name || null,
    email: profile?.mail ?? null,
    avatar: profile?.avatar ?? null,
    login,
    logout,
    /** Like `logout`, but resolves once Pollar has actually cleared its session. */
    logoutAsync: () => getClient().logout(),
    openLoginModal: openLogin,
  };
}

/**
 * What identifies ONE Pollar login across token refreshes: the user id when
 * the session carries it, else the verified email. Null while unknown.
 */
export function pollarMarker(state: AuthState, profile: PollarUserProfile | null): string | null {
  if (state.step !== "authenticated") return null;
  return state.session.userId ?? profile?.mail ?? null;
}
