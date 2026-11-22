"use client";

import { useState } from "react";
import Link from "next/link";
import { LuCheck, LuClock, LuArrowUpRight, LuQrCode } from "react-icons/lu";

import { useRegistrations, useRegistrationRefresh } from "@/hooks/use-registrations";
import { useAuth } from "@/hooks/use-auth";
import { useHydrated } from "@/hooks/use-storage";
import { ownsEventLocally } from "@/hooks/use-manage-event";
import { Button } from "@/components/ui/button";
import { RegisterDialog } from "@/components/event/register-dialog";
import { TicketContact } from "@/components/event/ticket-contact";
import { PaySection } from "@/components/payment/pay-section";
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
  const { isGoing, isPaid, isApplied, toggleGoing, withdraw, hasStamp, hydrated } =
    useRegistrations();
  const { isAuthenticated, openLoginModal } = useAuth();
  // The host's decision (approve / decline / remove) lands here without a
  // reload: your status is re-read while this page is open.
  useRegistrationRefresh(isAuthenticated);
  const mounted = useHydrated();
  // The registration sheet is controlled here and always mounted, so it
  // survives the flip from "tap to register" to "pending"/"going" beneath it.
  const [sheet, setSheet] = useState(false);
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
  const soldOut = event.capacity != null && event.attendees >= event.capacity;
  const collected = hydrated && hasStamp(event.id);
  // Paid events: a held spot only becomes "going" once the payment is
  // confirmed — in the app (verified on the ledger) or by the host, by hand.
  const settled = !paid || collected || (hydrated && isPaid(event.id));
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
        Manage your event
        <LuArrowUpRight className="size-4" aria-hidden />
      </Link>
    );
  }

  if (going) {
    return (
      <div className="flex flex-col items-center gap-2">
        <RegisterDialog event={event} open={sheet} onOpenChange={setSheet} />
        {settled ? (
          <p className="inline-flex h-7 items-center gap-1.5 rounded-full bg-gold pl-2 pr-3 text-[12.5px] font-bold text-navy">
            <LuCheck className="size-4" strokeWidth={2.5} aria-hidden />
            You&apos;re going!
          </p>
        ) : (
          <p className="inline-flex h-7 items-center gap-1.5 rounded-full bg-secondary pl-2 pr-3 text-[12.5px] font-semibold text-foreground">
            <LuClock className="size-4" aria-hidden />
            Spot reserved · pay to confirm
          </p>
        )}
        <div className="flex items-center gap-4">
          {collected ? (
            <span className="inline-flex items-center gap-1 text-[12px] font-semibold text-gold-deep">
              <LuCheck className="size-3.5" aria-hidden />
              aygo collected
            </span>
          ) : started ? (
            <Link
              href="/profile/collection"
              className="inline-flex items-center gap-1 text-[12px] font-semibold text-foreground"
            >
              <LuQrCode className="size-3.5" aria-hidden />
              Scan QR to check in
            </Link>
          ) : null}
          <button
            type="button"
            onClick={() => toggleGoing(event.id)}
            className="text-[12px] font-medium text-muted-foreground"
          >
            Cancel
          </button>
        </div>
        {/* Paid events: once the spot is held (instant reserve or approved
            request), paying stays front and centre — it's what turns the
            reservation into "going". A settled in-app payment keeps its receipt. */}
        {paid && !collected && (!settled || !!event.payment?.wallet) && (
          <PaySection event={event} settled={settled} />
        )}
      </div>
    );
  }

  if (pending) {
    return (
      <div className="flex flex-col items-center gap-2">
        <RegisterDialog event={event} open={sheet} onOpenChange={setSheet} />
        <p className="inline-flex h-7 items-center gap-1.5 rounded-full bg-secondary pl-2 pr-3 text-[12.5px] font-semibold text-foreground">
          <LuClock className="size-4" aria-hidden />
          Pending
        </p>
        <button
          type="button"
          onClick={() => withdraw(event.id)}
          className="text-[12px] font-medium text-muted-foreground"
        >
          Withdraw
        </button>
      </div>
    );
  }

  if (soldOut) {
    return (
      <div className="flex flex-col gap-2.5">
        <Button size="lg" disabled className={CTA}>
          Sold out
        </Button>
        <TicketContact event={event} />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2.5">
      <RegisterDialog event={event} open={sheet} onOpenChange={setSheet} />
      <Button size="lg" onClick={() => setSheet(true)} className={CTA}>
        {cta}
      </Button>
      <TicketContact event={event} />
    </div>
  );
}
