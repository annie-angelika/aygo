// Links the browser session to the signed-in account (see lib/server/session.ts
// for the model). Called from `useAccountSession` on every auth change.

import { api, USE_MOCK } from "@/lib/api/client";

/**
 * Make the server session the one that belongs to this account on this
 * browser, seeding the profile from the social login the first time.
 * Resolves `{ changed }` — when true the caller reloads so every local-first
 * cache re-hydrates from the right account. → `POST /me/session`
 */
export async function linkAccountSession(input: {
  account: string;
  name?: string | null;
  avatar?: string | null;
}): Promise<{ changed: boolean }> {
  if (USE_MOCK) return { changed: false };
  return api.post<{ changed: boolean }>("/me/session", {
    account: input.account,
    name: input.name ?? undefined,
    avatar: input.avatar ?? undefined,
  });
}

/** Sign out server-side: rotate to a fresh anonymous session. → `DELETE /me/session` */
export async function endAccountSession(): Promise<{ changed: boolean }> {
  if (USE_MOCK) return { changed: false };
  return api.delete<{ changed: boolean }>("/me/session");
}

/** Stable, non-reversible key for an account identity (SHA-256 hex). */
export async function accountKey(identity: string): Promise<string> {
  const bytes = new TextEncoder().encode(identity.trim().toLowerCase());
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}
