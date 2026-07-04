"use client";

import { useAsyncData } from "@/hooks/use-async-data";
import { useRegistrations } from "@/hooks/use-registrations";
import { AvatarStack } from "@/components/ui/avatar-stack";
import { AttendeesDialog, namePreview } from "@/components/event/attendees-dialog";
import { fetchAttendees } from "@/lib/api";
import type { AygoEvent } from "@/types";

/**
 * Who's really going: the roster comes from actual RSVPs on the backend —
 * no one is invented. Zero attendees renders an honest nudge, not fake faces.
 */
export function GoingSection({ event }: { event: AygoEvent }) {
  const { isGoing, hydrated } = useRegistrations();
  const joined = hydrated && isGoing(event.id);
  const { data } = useAsyncData(
    (signal) => fetchAttendees(event.id, signal),
    [event.id],
    { cacheKey: `attendees:${event.id}` },
  );
  const people = data ?? [];
  // Your own RSVP shows immediately, even before the background sync lands.
  const total = Math.max(people.length, joined ? 1 : 0);

  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-[10.5px] font-semibold uppercase tracking-wider text-amber-600">
        {total} going
      </h2>

      {total === 0 ? (
        <p className="text-[13px] leading-snug text-muted-foreground">
          No one has confirmed yet — be the first to join.
        </p>
      ) : (
        <AttendeesDialog
          event={event}
          people={people}
          joined={joined}
          total={total}
          triggerClassName="-mx-2 flex w-full flex-col items-start gap-3 rounded-xl px-2 py-2 text-left transition-colors hover:bg-muted/50"
        >
          <AvatarStack
            srcs={people.map((p) => p.avatar).filter((a): a is string => Boolean(a))}
            total={total}
            max={6}
            size="default"
          />
          <p className="text-[13px] leading-snug text-foreground/80">
            {joined && people.length === 0
              ? "You're going"
              : namePreview(people, total)}
          </p>
        </AttendeesDialog>
      )}
    </section>
  );
}
