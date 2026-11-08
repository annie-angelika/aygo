// Server-side verification of a Pollar login.
//
// Pollar's access tokens are DPoP-bound (RFC 9449): they only work together
// with a proof signed by the browser's per-session key, so a stolen token is
// useless and — the flip side — our server can't call Pollar with the token
// alone. What we do instead: the browser builds a DPoP proof for ONE specific
// Pollar request (`GET /v3/auth/session/resume`) and hands us token + proof;
// we relay exactly that request. Pollar checks the signature, the bound key,
// the `htu`/`htm`/`ath` claims and the proof's freshness, and answers with the
// verified profile. That profile — never anything the client typed — is the
// identity the account is keyed by. See lib/server/session.ts for what the
// identity is then used for.

import "server-only";
import { createHash } from "crypto";
import { HttpError } from "@/lib/server/http";

/** Same default as `@pollar/core` 0.12 (its `basePath` = `${baseUrl}/v3`). */
const BASE_URL = (process.env.NEXT_PUBLIC_POLLAR_BASE_URL || "https://sdk.api.pollar.xyz").replace(/\/$/, "");
const API_KEY = process.env.NEXT_PUBLIC_POLLAR_PUBLISHABLE_KEY ?? "";

/** The request the browser's proof is bound to (relayed verbatim). */
export const RESUME_URL = `${BASE_URL}/v3/auth/session/resume`;

/**
 * A proof names the URL it was signed for (`htu`), and Pollar refuses it
 * anywhere else. A tab opened before a deploy still runs the previous SDK and
 * signs for the API version of its day, so the relay follows the proof — but
 * only to Pollar's session check on a version we know, never to an arbitrary
 * URL. `v1` is retired by Pollar on 2026-11-30; drop it from the list then.
 */
const RELAYABLE = new Set(["v3", "v1"].map((v) => `${BASE_URL}/${v}/auth/session/resume`));

/** The session-check URL this proof was signed for, or the current one when it names nothing we relay. */
export function resumeUrlOf(dpopProof: string): string {
  try {
    const claims = JSON.parse(Buffer.from(dpopProof.split(".")[1] ?? "", "base64url").toString("utf8")) as {
      htu?: unknown;
    };
    if (typeof claims.htu === "string" && RELAYABLE.has(claims.htu)) return claims.htu;
  } catch {
    /* not a readable proof — Pollar will refuse it at the current URL */
  }
  return RESUME_URL;
}

/** What Pollar returns for a live session — the same shape as `PollarUserProfile`. */
export type VerifiedProfile = {
  mail: string;
  first_name: string;
  last_name: string;
  avatar: string;
  providers: {
    email: { address: string } | null;
    google: { id: string } | null;
    github: { id: string } | null;
    wallet: { address: string } | null;
  };
};

/** Pollar asked for a server nonce first: the client must rebuild the proof with it. */
export class DpopNonceRequired extends Error {
  constructor(readonly nonce: string) {
    super("DPoP nonce required");
    this.name = "DpopNonceRequired";
  }
}

const TIMEOUT_MS = 6_000;

/**
 * Relay `GET /auth/session/resume` with the browser's token + proof. Resolves
 * the verified profile, throws `DpopNonceRequired` when Pollar wants a nonce
 * round-trip, and a 401 `HttpError` for anything Pollar refuses.
 */
export async function verifyPollarSession(
  accessToken: string,
  dpopProof: string,
  origin: string,
): Promise<VerifiedProfile> {
  if (!API_KEY) throw new HttpError(503, "Login isn't configured on this server");
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  let res: Response;
  try {
    res = await fetch(resumeUrlOf(dpopProof), {
      method: "GET",
      headers: {
        "x-pollar-api-key": API_KEY,
        Authorization: `DPoP ${accessToken}`,
        DPoP: dpopProof,
        Accept: "application/json",
        // The publishable key is locked to the app's domains: Pollar answers
        // ORIGIN_NOT_ALLOWED (403) to any request without a browser Origin —
        // which is every server-to-server call. Relaying the app's own origin
        // is what makes this verification pass at all.
        Origin: origin,
      },
      signal: controller.signal,
      cache: "no-store",
    });
  } catch {
    throw new HttpError(502, "Couldn't reach the login provider — try again.");
  } finally {
    clearTimeout(timer);
  }

  // Pollar answers 401 (with a nonce challenge when it wants one) or 403 for a
  // token/proof it doesn't accept; both mean "not verified" to us. Its error
  // code rides along in the message and the server log so a failing relay is
  // diagnosable from a QA report instead of a silent "sign in again".
  if (res.status === 401 || res.status === 403) {
    const challenge = res.headers.get("www-authenticate") ?? "";
    const nonce = res.headers.get("dpop-nonce");
    if (nonce && challenge.includes("use_dpop_nonce")) throw new DpopNonceRequired(nonce);
    const code = await errorCode(res);
    console.error("Pollar session verification refused", { status: res.status, code });
    throw new HttpError(401, `Your login couldn't be verified — sign in again. (${code})`);
  }
  if (!res.ok) {
    console.error("Pollar session verification failed", { status: res.status, code: await errorCode(res) });
    throw new HttpError(502, "The login provider had a problem — try again.");
  }

  const body = (await res.json().catch(() => null)) as { content?: VerifiedProfile } | null;
  const profile = body?.content;
  if (!profile || typeof profile !== "object") throw new HttpError(502, "Unexpected login provider response");
  return profile;
}

/** Pollar's `{ code }` from an error body, or the HTTP status when there is none. */
async function errorCode(res: Response): Promise<string> {
  const body = (await res.json().catch(() => null)) as { code?: unknown } | null;
  return typeof body?.code === "string" && body.code ? body.code : `HTTP ${res.status}`;
}

/**
 * Every identity a verified profile answers to, strongest first: provider ids
 * (they survive an email change), then the verified email. All of them key the
 * SAME account, so signing in with Google on one device and an email code on
 * another lands on the same session (both are verified proofs of the email).
 * Empty when the profile carries nothing we can key an account by.
 */
export function identitiesOf(profile: VerifiedProfile): string[] {
  const p = profile.providers;
  const ids: string[] = [];
  if (p?.google?.id) ids.push(`google:${p.google.id}`);
  if (p?.github?.id) ids.push(`github:${p.github.id}`);
  if (p?.wallet?.address) ids.push(`wallet:${p.wallet.address}`);
  const mail = (profile.mail || p?.email?.address || "").trim().toLowerCase();
  if (mail) ids.push(`email:${mail}`);
  return ids;
}

/** Non-reversible key an account is stored under (SHA-256 hex of the identity). */
export function accountKeyOf(identity: string): string {
  return createHash("sha256").update(identity.trim().toLowerCase()).digest("hex");
}
