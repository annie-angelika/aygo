"use client";

// Paid events: aygo doesn't move money — the host told us where to be paid,
// so under the CTA the guest gets that in one tap: a WhatsApp chat with a
// prefilled message and/or the host's payment link, and the host confirms the
// payment by hand. When the host left no channel, fall back to an in-app
// question. Also used by the confirmation sheet right after reserving.

import { LuExternalLink } from "react-icons/lu";
import { FaWhatsapp } from "react-icons/fa6";

import { whatsappLink, payMessage } from "@/lib/payment";
import { cn } from "@/lib/utils";
import type { AygoEvent } from "@/types";

const LINK =
  "inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-foreground transition-colors hover:text-amber-700";
const PILL =
  "inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-full text-[13.5px] font-semibold transition-colors";

/** The host's payment channels as buttons (`prominent`) or text links. */
export function PayHostButtons({
  event,
  prominent = false,
  className,
}: {
  event: AygoEvent;
  prominent?: boolean;
  className?: string;
}) {
  const price = event.price ?? 0;
  const wa = event.payment?.whatsapp;
  const link = event.payment?.link;
  if (price <= 0 || (!wa && !link)) return null;
  const waHref = wa ? whatsappLink(wa, payMessage(event.host.name, event.title, price)) : null;

  return (
    <div className={cn(prominent ? "flex gap-2" : "flex items-center justify-center gap-4", className)}>
      {waHref && (
        <a
          href={waHref}
          target="_blank"
          rel="noreferrer"
          className={prominent ? cn(PILL, "bg-emerald-600 text-white hover:bg-emerald-700") : LINK}
        >
          <FaWhatsapp className="size-4" aria-hidden />
          Pay via WhatsApp
        </a>
      )}
      {link && (
        <a
          href={link}
          target="_blank"
          rel="noreferrer"
          className={prominent ? cn(PILL, "bg-card text-foreground ring-1 ring-border hover:bg-muted") : LINK}
        >
          <LuExternalLink className="size-4" aria-hidden />
          Payment link
        </a>
      )}
    </div>
  );
}

export function TicketContact({ event }: { event: AygoEvent }) {
  if (event.price == null || event.price <= 0) return null;
  // Paid events are paid in the app by bank QR, after reserving — the host's
  // WhatsApp / link are no longer a way to pay.
  return (
    <p className="text-center text-[11px] text-muted-foreground">
      Reserve first, then pay by bank QR in the app
    </p>
  );
}
