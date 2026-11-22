// GET  /api/me/payments/:eventId → { receipt, memo } — your in-app payment for
//                                  this event (null until paid) and the memo
//                                  your payment must carry
// POST /api/me/payments/:eventId → { txHash } → the verified receipt
//
// A guest pays the host's wallet in USDC from their own (bank QR → USDC is
// Pollar's ramp, in the browser). The server takes nobody's word for it: the
// transaction is read off the network the host's wallet lives on — Polygon
// ("0x…", where Bolivia's bank QR lands) or Stellar ("G…", with this guest's
// memo) — and must have succeeded and paid the host's wallet. 409 while the ledger
// hasn't confirmed it yet — the client asks again.

import { getStore } from "@/lib/server/store";
import { getSessionId } from "@/lib/server/session";
import { notifyHost, displayName, manageHref } from "@/lib/server/notify";
import { rateLimit, LIMITS } from "@/lib/server/rate-limit";
import { pathId, expectObject, str } from "@/lib/server/validate";
import { handler, json, readJson, HttpError } from "@/lib/server/http";
import { paymentMemo, verifyUsdcPayment, TX_HASH } from "@/lib/server/stellar";
import { EVM_TX_HASH, verifyPolygonUsdcPayment } from "@/lib/server/polygon";
import { isEvmAddress } from "@/lib/polygon";
import { formatUsdc } from "@/lib/stellar";
import type { PaymentReceipt } from "@/types";

type Ctx = { params: Promise<{ eventId: string }> };

export const GET = handler(async (_req: Request, ctx: Ctx) => {
  const sid = await getSessionId();
  const eventId = pathId((await ctx.params).eventId, "eventId");
  const receipt = await getStore().getPayment(sid, eventId);
  return json({ receipt, memo: paymentMemo(sid, eventId) });
});

export const POST = handler(async (req: Request, ctx: Ctx) => {
  const sid = await getSessionId();
  const eventId = pathId((await ctx.params).eventId, "eventId");
  rateLimit(req, "payment", sid, LIMITS.payment);
  const body = expectObject(await readJson(req), "payment");
  const txHash = str(body.txHash, "txHash", { max: 66 }).toLowerCase();

  const store = getStore();
  const existing = await store.getPayment(sid, eventId);
  if (existing) return json(existing);

  const event = await store.getEvent(eventId);
  if (!event) throw new HttpError(404, "Event not found");
  const wallet = event.payment?.wallet;
  if (!wallet || !event.price || event.price <= 0)
    throw new HttpError(400, "This event doesn't take payments in the app.");
  if (!(await store.getRegistrations(sid)).going.includes(eventId))
    throw new HttpError(400, "Reserve your spot first, then pay.");

  let verified;
  try {
    // The host's wallet says which network the money moves on.
    if (isEvmAddress(wallet)) {
      if (!EVM_TX_HASH.test(txHash)) throw new HttpError(400, "That isn't a valid transaction.");
      verified = await verifyPolygonUsdcPayment(txHash, { to: wallet });
    } else {
      if (!TX_HASH.test(txHash)) throw new HttpError(400, "That isn't a valid transaction.");
      verified = await verifyUsdcPayment(txHash, { to: wallet, memo: paymentMemo(sid, eventId) });
    }
  } catch (e) {
    if (e instanceof HttpError) throw e;
    console.error("Payment verification failed:", e);
    throw new HttpError(502, "Couldn't reach the network to confirm your payment. Try again in a moment.");
  }
  if (verified.status === "unknown")
    throw new HttpError(409, "Your payment is still confirming.");
  if (verified.status === "invalid") throw new HttpError(400, verified.reason);

  const receipt: PaymentReceipt = { txHash, amount: verified.amount, asset: "USDC", at: verified.at };
  if ((await store.recordPayment(sid, eventId, receipt)) === "duplicate")
    throw new HttpError(400, "That transaction was already used for another payment.");
  await notifyHost(eventId, {
    kind: "registration",
    title: `${await displayName(sid)} paid for ${event.title}`,
    body: `${formatUsdc(receipt.amount)} USDC reached your wallet (ticket: Bs ${event.price}).`,
    href: manageHref(eventId, "guests"),
  });
  return json(receipt, 201);
});
