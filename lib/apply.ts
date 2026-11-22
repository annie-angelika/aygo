// Presentation config for the in-app "apply to join" flow (Luma-style).
// Approval-vs-instant comes from the event's REAL `requiresApproval` setting
// (the host picks it when creating/managing the event); the "good to know"
// lines are derived from real event fields only — price, how the host gets
// paid, how the spot is secured. Nothing is invented on the host's behalf.

import { hasPaymentChannel } from "@/lib/payment";
import type { AygoEvent } from "@/types";

export type ApplyConfig = {
  /** Curated event → the host reviews each request before you get a spot. */
  requiresApproval: boolean;
  /** Paid event with a WhatsApp number / payment link to settle it. */
  canPayHost: boolean;
  /** Short, scannable things worth knowing before you commit. */
  requirements: string[];
  /** Whether the host asks for a note alongside the request. */
  asksMessage: boolean;
};

export function applyConfigFor(event: AygoEvent): ApplyConfig {
  // The host's real setting — never derived or invented.
  const requiresApproval = event.requiresApproval ?? false;
  const paid = event.price != null && event.price > 0;
  const canPayHost = paid && hasPaymentChannel({
    payWhatsapp: event.payment?.whatsapp,
    payLink: event.payment?.link,
    payWallet: event.payment?.wallet,
  });

  const requirements: string[] = [];

  // What it costs, up front — and how it's settled.
  if (paid) {
    requirements.push(
      `Cover is Bs ${event.price} — you pay it in the app by bank QR once your spot is reserved.`,
    );
  } else {
    requirements.push("Free to join, no cover.");
  }

  // How your spot is secured.
  requirements.push(
    requiresApproval
      ? "Show up on time so the host can save your spot."
      : paid
        ? "Your spot is held when you register and confirmed once your payment is."
        : "Your spot is held the moment you register.",
  );

  return { requiresApproval, canPayHost, requirements, asksMessage: requiresApproval };
}
