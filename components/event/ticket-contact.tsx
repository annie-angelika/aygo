"use client";

// Paid events: aygo doesn't move money — the host told us where to be paid,
// so under the CTA the guest gets that in one tap: a WhatsApp chat with a
// prefilled message and/or the host's payment link, and the host confirms the
// payment by hand. When the host left no channel, fall back to an in-app
// question. Also used by the confirmation sheet right after reserving.

import { LuTicket, LuExternalLink } from "react-icons/lu";
import { FaWhatsapp } from "react-icons/fa6";

import { ActionDialog } from "@/components/event/action-dialog";
import { useAuth } from "@/hooks/use-auth";
import { sendEventFeedback } from "@/lib/api";
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
  const { isAuthenticated, openLoginModal } = useAuth();
  if (event.price == null || event.price <= 0) return null;
  const hasChannel = !!(event.payment?.whatsapp || event.payment?.link);

  return (
    <div className="flex flex-col items-center gap-1.5">
      {/* Signed out, every path leads to the login modal first: paying rides
          on a registration, and the host's WhatsApp number isn't for anonymous
          visitors to harvest. */}
      {hasChannel && isAuthenticated ? (
        <PayHostButtons event={event} />
      ) : hasChannel ? (
        <button type="button" onClick={openLoginModal} className={LINK}>
          <LuTicket className="size-4" aria-hidden />
          Sign in to reserve &amp; pay
        </button>
      ) : isAuthenticated ? (
        <ActionDialog
          label="Ask about tickets"
          trigger={
            <button type="button" className={LINK}>
              <LuTicket className="size-4" aria-hidden />
              Ask about tickets
            </button>
          }
          icon={<LuTicket className="size-5" aria-hidden />}
          title="Buy a ticket"
          description={`Tickets are Bs ${event.price}, paid directly to ${event.host.name}. Send them a message to arrange it.`}
          placeholder="How can I pay for my ticket?"
          submitLabel="Send message"
          successTitle="Message sent"
          successBody={`${event.host.name} will reply with how to pay. Watch your inbox.`}
          defaultMessage={`Hi ${event.host.name}! I'd like to buy a ticket for "${event.title}". How do I pay?`}
          onSubmit={(m) => sendEventFeedback(event.id, "question", m)}
        />
      ) : (
        <button type="button" onClick={openLoginModal} className={LINK}>
          <LuTicket className="size-4" aria-hidden />
          Ask about tickets
        </button>
      )}
      <p className="text-[11px] text-muted-foreground">
        You pay the host directly · they confirm it by hand
      </p>
    </div>
  );
}
