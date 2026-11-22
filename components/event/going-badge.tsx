"use client";

import { LuCheck, LuClock } from "react-icons/lu";

import { useRegistrations } from "@/hooks/use-registrations";
import type { AygoEvent } from "@/types";

/**
 * Where you stand on an event you hold a spot for: gold "Going" once it is
 * really yours, a quiet "Pay to confirm" while a paid event's ticket is still
 * unpaid — a reserved spot isn't a confirmed one.
 */
export function GoingBadge({ event }: { event: Pick<AygoEvent, "id" | "price"> }) {
  const { awaitsPayment } = useRegistrations();
  if (awaitsPayment(event)) {
    return (
      <span className="inline-flex h-[22px] items-center gap-1 rounded-full bg-secondary pl-1.5 pr-2 text-[11.5px] font-semibold text-foreground">
        <LuClock className="size-3" aria-hidden />
        Pay to confirm
      </span>
    );
  }
  return (
    <span className="inline-flex h-[22px] items-center gap-1 rounded-full bg-gold pl-1.5 pr-2 text-[11.5px] font-bold text-navy">
      <LuCheck className="size-3" strokeWidth={2.5} aria-hidden />
      Going
    </span>
  );
}
