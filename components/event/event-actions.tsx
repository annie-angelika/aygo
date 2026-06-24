"use client";

import { LuCheck, LuClock } from "react-icons/lu";

import { useRegistrations } from "@/hooks/use-registrations";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { RegisterDialog } from "@/components/event/register-dialog";
import { applyConfigFor } from "@/lib/apply";
import type { AygoEvent } from "@/types";

/**
 * The single primary action on the detail screen. You register in-app (no more
 * WhatsApp handoff): tap to open the registration sheet, then the button reflects
 * where you stand — confirmed and going, or a request pending the host's approval.
 * Smallest client island.
 */
export function EventActions({ event }: { event: AygoEvent }) {
  const { isGoing, isApplied, toggleGoing, withdraw, addStamp, hydrated } =
    useRegistrations();
  const { isAuthenticated, openLoginModal } = useAuth();
  const going = hydrated && isGoing(event.id);
  const pending = hydrated && isApplied(event.id);
  const cfg = applyConfigFor(event);

  // Registering needs an identity. Signed-out, the CTA opens the login modal;
  // the registration sheet (which prefills your profile) only appears once
  // you're in, so the host always sees who's applying.
  if (!isAuthenticated) {
    return (
      <Button
        size="lg"
        onClick={openLoginModal}
        className="h-12 w-full rounded-full text-[14px]"
      >
        {cfg.requiresApproval ? "Request to join" : "Get your spot"}
      </Button>
    );
  }

  if (going) {
    return (
      <div className="flex flex-col items-center gap-2">
        <p className="inline-flex items-center gap-1 text-[12.5px] font-semibold text-emerald-700">
          <LuCheck className="size-4" /> You&apos;re going to this event!
        </p>
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => addStamp(event)}
            className="text-[12px] font-semibold text-foreground"
          >
            Mark as attended
          </button>
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
        <p className="inline-flex items-center gap-1 text-[12.5px] font-semibold text-amber-600">
          <LuClock className="size-4" /> Request pending · waiting on{" "}
          {event.host.name}
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
    <RegisterDialog event={event}>
      <Button size="lg" className="h-12 w-full rounded-full text-[14px]">
        {cfg.requiresApproval ? "Request to join" : "Get your spot"}
      </Button>
    </RegisterDialog>
  );
}
