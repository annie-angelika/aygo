// Pollar asks before every signature ("Confirm transaction") unless the app's
// dashboard policy says otherwise. For the two signatures aygo itself starts
// from a button that already says exactly what will happen — "Set up my
// wallet" (accept USDC) and "Pay now" (amount and recipient on the card) —
// that second prompt is noise, so the button's tap counts as the answer.
//
// Nothing is confirmed blindly: the caller describes the ONE signature it is
// about to ask for, and only a pending request that matches it, within a few
// seconds, is answered. Anything else still gets Pollar's own prompt.

import type { PendingConfirmation } from "@pollar/core";

type Expected = { match: (c: PendingConfirmation) => boolean; until: number };

const expected: Expected[] = [];
const WINDOW_MS = 20_000;

/** Call right before the signing call the user just asked for. */
export function expectSignature(match: Expected["match"]): void {
  expected.push({ match, until: Date.now() + WINDOW_MS });
}

/** True (once) when this pending request is one the user just asked for. */
export function takeExpected(c: PendingConfirmation): boolean {
  const now = Date.now();
  for (let i = expected.length - 1; i >= 0; i--) if (expected[i].until < now) expected.splice(i, 1);
  const i = expected.findIndex((e) => e.match(c));
  if (i < 0) return false;
  expected.splice(i, 1);
  return true;
}

const same = (a: unknown, b: string) => typeof a === "string" && a === b;

/** The USDC trustline "Set up my wallet" asks for. */
export const trustlineFor =
  (asset: { code: string; issuer: string }) =>
  (c: PendingConfirmation): boolean => {
    const a = (c.details as { asset?: { code?: unknown; issuer?: unknown } } | undefined)?.asset;
    return (
      c.network === "STELLAR" &&
      c.operation === "change_trust" &&
      same(a?.code, asset.code) &&
      same(a?.issuer, asset.issuer)
    );
  };

/** The exact payment "Pay now" sends: this amount, to this wallet. */
export const paymentOf =
  (destination: string, amount: string) =>
  (c: PendingConfirmation): boolean =>
    c.operation === "payment" &&
    same(c.details?.destination, destination) &&
    same(c.details?.amount, amount);
