"use client";

import { useRegistrations } from "@/hooks/use-registrations";
import { AvatarStack } from "@/components/ui/avatar-stack";
import { AttendeesDialog, namePreview } from "@/components/event/attendees-dialog";
import type { AygoEvent, TravelerProfile } from "@/types";

/**
 * The flat attendee roster that sits under the hosts (Luma-style): an eyebrow,
 * a row of faces, and the names — tap to open the same "who's going" modal.
 */
export function GoingSection({
  event,
  people,
}: {
  event: AygoEvent;
  people: TravelerProfile[];
}) {
  const { isGoing, hydrated } = useRegistrations();
  const joined = hydrated && isGoing(event.id);

  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-[10.5px] font-semibold uppercase tracking-wider text-amber-600">
        {event.attendees} going
      </h2>
      <AttendeesDialog
        event={event}
        people={people}
        joined={joined}
        triggerClassName="-mx-2 flex w-full flex-col items-start gap-3 rounded-xl px-2 py-2 text-left transition-colors hover:bg-muted/50"
      >
        <AvatarStack
          srcs={people.map((p) => p.avatar)}
          total={event.attendees}
          max={6}
          size="default"
        />
        <p className="text-[13px] leading-snug text-foreground/80">
          {namePreview(people, event.attendees)}
        </p>
      </AttendeesDialog>
    </section>
  );
}
