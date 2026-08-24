"use client";

// Paid events: tickets aren't sold in-app yet (you pay the host directly), so
// the secondary action under the CTA opens a message to the host about buying
// one — prefilled, so it's one tap — and, when the host shared a phone, a
// WhatsApp deep link as the faster alternative.

import { LuTicket } from "react-icons/lu";
import { FaWhatsapp } from "react-icons/fa6";

import { ActionDialog } from "@/components/event/action-dialog";
import { useAuth } from "@/hooks/use-auth";
import { sendEventFeedback } from "@/lib/api";
import type { AygoEvent } from "@/types";

export function TicketContact({ event }: { event: AygoEvent }) {
  const { isAuthenticated, openLoginModal } = useAuth();
  if (event.price == null || event.price <= 0) return null;

  const wa = event.host.phone
    ? `https://wa.me/${event.host.phone.replace(/\D/g, "")}?text=${encodeURIComponent(
        `Hi ${event.host.name}! I'd like to buy a ticket for "${event.title}" (Bs ${event.price}). How do I pay?`,
      )}`
    : null;
  const linkClass =
    "inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-foreground transition-colors hover:text-amber-700";

  return (
    <div className="flex items-center justify-center gap-4">
      {isAuthenticated ? (
        <ActionDialog
          label="Ask about tickets"
          trigger={
            <button type="button" className={linkClass}>
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
        <button type="button" onClick={openLoginModal} className={linkClass}>
          <LuTicket className="size-4" aria-hidden />
          Ask about tickets
        </button>
      )}
      {wa && (
        <a href={wa} target="_blank" rel="noreferrer" className={linkClass}>
          <FaWhatsapp className="size-4" aria-hidden />
          WhatsApp
        </a>
      )}
    </div>
  );
}
