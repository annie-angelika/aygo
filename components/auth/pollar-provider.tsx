"use client";

import { PollarProvider } from "@pollar/react";
import "@pollar/react/styles.css";

import type { StellarNetwork } from "@pollar/core";

// Publishable key is read at build time and inlined into the client bundle
// (NEXT_PUBLIC_*). Empty string when unconfigured: the provider still mounts so
// `usePollar()` works everywhere and the app browses normally — only the login
// flow is inert until a real key is set in `.env.local`.
const apiKey = process.env.NEXT_PUBLIC_POLLAR_PUBLISHABLE_KEY ?? "";
const stellarNetwork =
  (process.env.NEXT_PUBLIC_POLLAR_NETWORK as StellarNetwork) ?? "testnet";

if (!apiKey && process.env.NODE_ENV !== "production") {
  // Nudge during development; never throws so the app keeps working.
  console.warn(
    "[aygo] NEXT_PUBLIC_POLLAR_PUBLISHABLE_KEY is not set — login is disabled. " +
      "Add it to .env.local to enable Pollar social login.",
  );
}

/**
 * Wraps the app in Pollar's context so any client island can call `usePollar()`
 * (and our `useAuth()`). Owns the login/wallet modals Pollar renders internally.
 */
export function PollarAuthProvider({ children }: { children: React.ReactNode }) {
  return (
    <PollarProvider client={{ apiKey, stellarNetwork }}>
      {children}
    </PollarProvider>
  );
}
