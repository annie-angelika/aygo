"use client";

import { useState } from "react";
import Link from "next/link";
import { LuCheck, LuClock, LuArrowUpRight } from "react-icons/lu";

import { useRegistrations } from "@/hooks/use-registrations";
import { useAuth } from "@/hooks/use-auth";
import { useHydrated } from "@/hooks/use-storage";
import { ownsEventLocally } from "@/hooks/use-manage-event";
import { Button } from "@/components/ui/button";
import { RegisterDialog } from "@/components/event/register-dialog";
import { TicketContact } from "@/components/event/ticket-contact";
import { applyConfigFor } from "@/lib/apply";
import type { AygoEvent } from "@/types";

const CTA =
  "h-12 w-full rounded-full text-[14px] font-semibold shadow-[0_12px_24px_-12px_rgba(9,25,53,0.6)]";

/**
 * The single primary action on the detail screen. You register in-app (no more
 * WhatsApp handoff): tap to open the registration sheet, then the button reflects
 * where you stand — confirmed and going (gold), or a request pending the host's
 * approval (navy-soft). Smallest client island.
 */
export function EventActions({ event }: { event: AygoEvent }) {
  const { isGoing, isApplied, toggleGoing, withdraw, addStamp, hydrated } =
    useRegistrations();
  const { isAuthenticated, openLoginModal } = useAuth();
  const mounted = useHydrated();
  // The host's own event: the server refuses self-registration, so don't
  // offer it — point at the dashboard instead.
  const mine = mounted && ownsEventLocally(event.id);
  // Check-in opens once the event has started (the server enforces the same).
  // Read the clock once per mount (render must stay pure).
  const [now] = useState(() => Date.now());
  const started = new Date(event.startsAt).getTime() <= now;
  const going = hydrated && isGoing(event.id);
  const pending = hydrated && isApplied(event.id);
  const cfg = applyConfigFor(event);
  const paid = event.price != null && event.price > 0;
  const cta = cfg.requiresApproval
    ? "Request to join"
    : paid
      ? `Reserve · Bs ${event.price}`
      : "Get your spot";

  // Registering needs an identity. Signed-out, the CTA opens the login modal;
  // the registration sheet (which prefills your profile) only appears once
  // you're in, so the host always sees who's applying.
  if (!isAuthenticated) {
    return (
      <div className="flex flex-col gap-2.5">
        <Button size="lg" onClick={openLoginModal} className={CTA}>
          {cta}
        </Button>
        <TicketContact event={event} />
      </div>
    );
  }

  if (mine) {
    return (
      <Link
        href={`/manage/${event.id}`}
        className="inline-flex h-12 w-full items-center justify-center gap-1.5 rounded-full bg-card text-[14px] font-semibold text-foreground ring-1 ring-border transition-colors hover:bg-muted"
      >
        You&apos;re hosting this event — manage it
        <LuArrowUpRight className="size-4" aria-hidden />
      </Link>
    );
  }

  if (going) {
    return (
      <div className="flex flex-col items-center gap-2">
        <p className="inline-flex h-7 items-center gap-1.5 rounded-full bg-gold pl-2 pr-3 text-[12.5px] font-bold text-navy">
          <LuCheck className="size-4" strokeWidth={2.5} aria-hidden />
          You&apos;re going to this event!
        </p>
        <div className="flex items-center gap-4">
          {started ? (
            <button
              type="button"
              onClick={() => addStamp(event)}
              className="text-[12px] font-semibold text-foreground"
            >
              Mark as attended
            </button>
          ) : (
            <span className="text-[12px] font-medium text-muted-foreground">
              Check in once it starts
            </span>
          )}
          <button
            type="button"
            onClick={() => toggleGoing(event.id)}
            className="text-[12px] font-medium text-muted-foreground"
          >
            Cancel my spot
          </button>
        </div>
      </div>
    );
  }

  if (pending) {
    return (
      <div className="flex flex-col items-center gap-2">
        <p className="inline-flex h-7 items-center gap-1.5 rounded-full bg-secondary pl-2 pr-3 text-[12.5px] font-semibold text-foreground">
          <LuClock className="size-4" aria-hidden />
          Request pending · waiting on {event.host.name}
        </p>
        <button
          type="button"
          onClick={() => withdraw(event.id)}
          className="text-[12px] font-medium text-muted-foreground"
        >
          Withdraw request
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2.5">
      <RegisterDialog event={event}>
        <Button size="lg" className={CTA}>
          {cta}
        </Button>
      </RegisterDialog>
      <TicketContact event={event} />
    </div>
  );
}
