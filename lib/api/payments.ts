// In-app payments for paid events: the guest's wallet pays the host's in USDC
// and the server confirms it on the Stellar ledger (see hooks/use-qr-pay).

import type { PaymentReceipt } from "@/types";
import { api } from "@/lib/api/client";

export type PaymentState = {
  /** Null until the server has verified a payment for this spot. */
  receipt: PaymentReceipt | null;
  /** The memo the payment must carry so it's recognised as yours. */
  memo: string;
};

/** Your payment for an event + the memo to pay under. → `GET /me/payments/:eventId` */
export async function fetchPayment(eventId: string, signal?: AbortSignal): Promise<PaymentState> {
  return api.get<PaymentState>(`/me/payments/${eventId}`, undefined, signal);
}

/** Hand the server a sent transaction to verify. 409 while it confirms. → `POST /me/payments/:eventId` */
export async function reportPayment(eventId: string, txHash: string): Promise<PaymentReceipt> {
  return api.post<PaymentReceipt>(`/me/payments/${eventId}`, { txHash });
}
