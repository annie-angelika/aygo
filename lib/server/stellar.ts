// Reads a payment off the public Stellar ledger (Horizon). The server never
// takes the browser's word that a guest paid: it looks the transaction up and
// checks it succeeded, carries this guest's memo, and moved USDC to the
// host's wallet.

import "server-only";
import { createHash } from "node:crypto";
import { HORIZON_URL, USDC } from "@/lib/stellar";

export const TX_HASH = /^[0-9a-f]{64}$/;

/**
 * The memo that ties a payment to one guest's spot at one event. Derived from
 * the session id (unforgeable without the cookie secret), so somebody else's
 * transaction can't be claimed. 26 chars — a Stellar text memo holds 28 bytes.
 */
export function paymentMemo(sid: string, eventId: string): string {
  const digest = createHash("sha256").update(`${sid}|${eventId}`).digest("hex");
  return `aygo-${digest.slice(0, 21)}`;
}

export type VerifiedPayment =
  | { status: "ok"; amount: string; at: string }
  /** Horizon doesn't know the transaction (yet) — ask again shortly. */
  | { status: "unknown" }
  | { status: "invalid"; reason: string };

async function horizon<T>(path: string): Promise<{ status: number; body: T | null }> {
  const res = await fetch(`${HORIZON_URL}${path}`, {
    cache: "no-store",
    signal: AbortSignal.timeout(10_000),
  });
  return { status: res.status, body: res.ok ? ((await res.json()) as T) : null };
}

/** The USDC a successful transaction paid to `to` under `memo`. */
export async function verifyUsdcPayment(
  txHash: string,
  { to, memo }: { to: string; memo: string },
): Promise<VerifiedPayment> {
  const tx = await horizon<{
    successful: boolean;
    memo_type: string;
    memo?: string;
    created_at: string;
  }>(`/transactions/${txHash}`);
  if (tx.status === 404) return { status: "unknown" };
  if (!tx.body) throw new Error(`Horizon answered ${tx.status}`);
  if (!tx.body.successful) return { status: "invalid", reason: "That transaction failed on the network." };
  if (tx.body.memo_type !== "text" || tx.body.memo !== memo)
    return { status: "invalid", reason: "That transaction isn't the payment for this spot." };

  const ops = await horizon<{
    _embedded: {
      records: {
        type: string;
        to?: string;
        amount?: string;
        asset_code?: string;
        asset_issuer?: string;
      }[];
    };
  }>(`/transactions/${txHash}/payments?limit=100`);
  if (!ops.body) throw new Error(`Horizon answered ${ops.status}`);
  // Summed in stroops (1e-7) so decimals never drift.
  let stroops = BigInt(0);
  for (const op of ops.body._embedded.records) {
    if (
      op.type === "payment" &&
      op.to === to &&
      op.asset_code === USDC.code &&
      op.asset_issuer === USDC.issuer &&
      op.amount
    ) {
      const [whole, frac = ""] = op.amount.split(".");
      stroops += BigInt(whole) * BigInt(10_000_000) + BigInt(frac.padEnd(7, "0").slice(0, 7));
    }
  }
  if (stroops <= BigInt(0))
    return { status: "invalid", reason: "That transaction didn't pay USDC to the host." };
  const whole = stroops / BigInt(10_000_000);
  const frac = (stroops % BigInt(10_000_000)).toString().padStart(7, "0");
  return { status: "ok", amount: `${whole}.${frac}`, at: tx.body.created_at };
}
