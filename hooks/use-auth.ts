"use client";

import { useEffect, useState } from "react";
import { usePollar } from "@pollar/react";
import type { PollarUserProfile } from "@pollar/core";

import { openLogin } from "@/components/auth/login-modal-store";

/**
 * The single source of truth for "is someone signed in" across the app, built
 * on Pollar. `isAuthenticated` gates the UI; `profile` carries the signed-in
 * identity (name / email / avatar) so screens like the register sheet can
 * prefill instead of asking. `openLoginModal` opens aygo's own sign-in modal
 * (components/auth/login-modal), built on Pollar's headless client.
 *
 * The profile is held in memory by the SDK (never persisted), so we subscribe
 * to auth-state changes to keep it reactive after login / logout / resume.
 */
export function useAuth() {
  const { isAuthenticated, login, logout, getClient } = usePollar();
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

  const name = profile
    ? `${profile.first_name} ${profile.last_name}`.trim()
    : null;

  return {
    isAuthenticated,
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
