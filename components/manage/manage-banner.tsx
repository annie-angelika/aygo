"use client";

// Luma-style "you have manage access" strip on the event page — shown only in
// the browser that created the event (instant localStorage check; the manage
// screen itself re-verifies ownership server-side).

import Link from "next/link";
import { LuArrowUpRight } from "react-icons/lu";

import { useHydrated } from "@/hooks/use-storage";
import { ownsEventLocally } from "@/hooks/use-manage-event";

export function ManageBanner({ eventId }: { eventId: string }) {
  const hydrated = useHydrated();
  if (!hydrated || !ownsEventLocally(eventId)) return null;

  return (
    <div className="flex items-center justify-between gap-3 rounded-[18px] bg-card px-4 py-3 ring-1 ring-foreground/8">
      <p className="min-w-0 text-[13px] leading-snug text-muted-foreground">
        You have manage access for this event.
      </p>
      <Link
        href={`/manage/${eventId}`}
        className="inline-flex h-9 shrink-0 items-center gap-1 rounded-full bg-primary px-4 text-[13px] font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
      >
        Manage
        <LuArrowUpRight className="size-3.5 text-gold" aria-hidden />
      </Link>
    </div>
  );
}
