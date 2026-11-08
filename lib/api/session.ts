// Links the browser session to the signed-in account (see lib/server/session.ts
// for the model). Called from `useAccountSession` on every auth change.

import { api, ApiError } from "@/lib/api/client";

/** Pollar wants the DPoP proof rebuilt with this server nonce, then retried. */
export class NonceChallenge extends Error {
  constructor(readonly nonce: string) {
    super("DPoP nonce required");
    this.name = "NonceChallenge";
  }
}

/** What the server says about this browser's session. */
export type SessionState = {
  /** The session belongs to a verified account (vs. an anonymous guest). */
  account: boolean;
  /** Short tag of the session id in force — changes when the session does. */
  fingerprint: string;
};

// Both calls gate the sign-in UI ("Signing in…" shows until they answer), so
// neither may wait on a stalled connection forever: a request that outlives
// its budget fails like any network error and the caller retries or reports.
const STATE_TIMEOUT_MS = 10_000;
/** Covers the server's own relay to Pollar (6 s) plus the account lookup. */
const LINK_TIMEOUT_MS = 12_000;

/** Is this browser's session an account's, and which session is it? → `GET /me/session` */
export async function fetchSessionState(
  signal: AbortSignal = AbortSignal.timeout(STATE_TIMEOUT_MS),
): Promise<SessionState> {
  return api.get<SessionState>("/me/session", undefined, signal);
}

/**
 * Prove the login to the server (a Pollar access token plus a DPoP proof for
 * Pollar's own session check, which the server relays) so this browser's
 * session becomes the one that belongs to the verified account — on any
 * device. Resolves `{ changed, fingerprint }`: when `changed` the caller
 * reloads so every local-first cache re-hydrates from the right account.
 * Throws `NonceChallenge` when the proof must be rebuilt with a nonce.
 * → `POST /me/session`
 */
export async function linkAccountSession(input: {
  accessToken: string;
  dpop: string;
}): Promise<{ changed: boolean; fingerprint: string }> {
  try {
    return await api.post<{ changed: boolean; fingerprint: string }>(
      "/me/session",
      input,
      AbortSignal.timeout(LINK_TIMEOUT_MS),
    );
  } catch (e) {
    const nonce =
      e instanceof ApiError && e.status === 428 && e.body && typeof e.body === "object"
        ? (e.body as { nonce?: unknown }).nonce
        : undefined;
    if (typeof nonce === "string" && nonce) throw new NonceChallenge(nonce);
    throw e;
  }
}

/** Sign out server-side: rotate to a fresh anonymous session. → `DELETE /me/session` */
export async function endAccountSession(): Promise<{ changed: boolean }> {
  return api.delete<{ changed: boolean }>("/me/session");
}
