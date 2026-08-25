import { LuCheck, LuClock } from "react-icons/lu";

import { AygoStar } from "@/components/ui/brand-icons";
import { Button } from "@/components/ui/button";
import { DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { CategoryChip } from "@/components/event/category-chip";
import { PayHostButtons } from "@/components/event/ticket-contact";
import type { ApplyConfig } from "@/lib/apply";
import type { AygoEvent } from "@/types";

/**
 * The confirmation that stays on screen after you submit: a gold aygo star
 * for a saved spot (or a clock while the host reviews), and your ticket — a
 * navy stub with the event, a white body with your status. No attendee QR:
 * the host confirms you from their guest list.
 */
export function RegisterTicket({
  event,
  cfg,
  onDone,
}: {
  event: AygoEvent;
  cfg: ApplyConfig;
  onDone: () => void;
}) {
  const pending = cfg.requiresApproval;
  const paid = event.price != null && event.price > 0;
  return (
    <div className="flex flex-col items-center gap-4 px-5 pb-6 pt-7 text-center">
      <span
        className={
          pending
            ? "grid size-14 place-items-center rounded-full bg-secondary text-foreground"
            : "grid size-14 place-items-center rounded-full bg-gold text-navy"
        }
      >
        {pending ? (
          <LuClock className="size-7" aria-hidden />
        ) : (
          <AygoStar className="size-7" />
        )}
      </span>
      <div className="flex flex-col gap-1">
        <DialogTitle className="text-[22px] font-bold leading-[1.15] tracking-[-0.03em]">
          {pending ? "Request sent" : "You're going!"}
        </DialogTitle>
        <DialogDescription className="mx-auto max-w-[18rem] text-[13px] leading-snug">
          {pending
            ? `${event.host.name} will review your request for "${event.title}". We'll let you know the moment you're approved.`
            : `Your spot for "${event.title}" is saved. See you there!`}
        </DialogDescription>
      </div>

      <div className="flex w-full flex-col overflow-hidden rounded-[20px] bg-card shadow-[0_18px_40px_-22px_rgba(9,25,53,0.45)] ring-1 ring-foreground/8">
        <div className="flex items-center gap-3 bg-navy px-4 py-3.5 text-left">
          <CategoryChip category={event.category} className="bg-white/12" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-[14px] font-semibold text-cream">
              {event.title}
            </p>
            <p className="truncate text-[11.5px] text-cream/70">
              {event.dayLabel} · {event.timeLabel} · {event.place}
            </p>
          </div>
        </div>
        <div className="relative flex flex-wrap items-center justify-center gap-2 px-4 pb-4 pt-5">
          {/* Ticket-stub notches at the seam. */}
          <span aria-hidden className="absolute -left-2.5 -top-2.5 size-5 rounded-full bg-background" />
          <span aria-hidden className="absolute -right-2.5 -top-2.5 size-5 rounded-full bg-background" />
          {pending ? (
            <span className="inline-flex h-[22px] items-center gap-1 rounded-full bg-secondary pl-1.5 pr-2 text-[11.5px] font-semibold text-foreground">
              <LuClock className="size-3" aria-hidden />
              Pending {event.host.name}&apos;s approval
            </span>
          ) : (
            <span className="inline-flex h-[22px] items-center gap-1 rounded-full bg-gold pl-1.5 pr-2 text-[11.5px] font-bold text-navy">
              <LuCheck className="size-3" strokeWidth={2.5} aria-hidden />
              Going
            </span>
          )}
          {paid && (
            <span className="inline-flex h-[22px] items-center rounded-full bg-secondary px-2 text-[11.5px] font-semibold text-foreground">
              Pay Bs {event.price} at the door
            </span>
          )}
        </div>
      </div>

      {paid && (event.payment?.whatsapp || event.payment?.link) && (
        <div className="flex w-full flex-col gap-2">
          <p className="text-[12px] font-semibold text-foreground">
            Next step: pay {event.host.name} Bs {event.price}
          </p>
          <PayHostButtons event={event} prominent />
          <p className="text-[11px] text-muted-foreground">
            You pay the host directly · in-app payments coming soon
          </p>
        </div>
      )}

      <Button
        size="lg"
        onClick={onDone}
        className="h-12 w-full rounded-full text-[14px] font-semibold"
      >
        Done
      </Button>
    </div>
  );
}
