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

/**
 * Prove the login to the server (a Pollar access token plus a DPoP proof for
 * Pollar's own session check, which the server relays) so this browser's
 * session becomes the one that belongs to the verified account — on any
 * device. Resolves `{ changed }`: when true the caller reloads so every
 * local-first cache re-hydrates from the right account. Throws
 * `NonceChallenge` when the proof must be rebuilt with a nonce.
 * → `POST /me/session`
 */
export async function linkAccountSession(input: {
  accessToken: string;
  dpop: string;
}): Promise<{ changed: boolean }> {
  try {
    return await api.post<{ changed: boolean }>("/me/session", input);
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
