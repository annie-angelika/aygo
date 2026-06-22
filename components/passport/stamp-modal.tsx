"use client";

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { CategoryChip } from "@/components/event/category-chip";
import { CATEGORY_META, events } from "@/lib/events-data";
import { cn } from "@/lib/utils";
import type { Stamp } from "@/types";

/** Detail of a single stamp: why and where you earned it. */
export function StampModal({
  stamp,
  onClose,
}: {
  stamp: Stamp | null;
  onClose: () => void;
}) {
  const event = stamp ? events.find((e) => e.id === stamp.eventId) : undefined;
  const meta = stamp ? CATEGORY_META[stamp.category] : undefined;

  return (
    <Dialog open={!!stamp} onOpenChange={(open) => !open && onClose()}>
      {stamp && meta && (
        <DialogContent className="items-center gap-3 text-center">
          <div
            className={cn(
              "grid size-20 place-items-center rounded-full shadow-sm ring-1 ring-current/15",
              meta.soft,
              meta.accent,
            )}
          >
            <meta.Icon className="size-9" aria-hidden />
          </div>

          <div className="flex flex-col items-center gap-2">
            <DialogTitle>{stamp.title}</DialogTitle>
            <CategoryChip category={stamp.category} />
          </div>

          {event && (
            <p className="text-[12.5px] text-muted-foreground">
              {event.dayLabel} · {event.place}, {event.city}
            </p>
          )}

          <p className="mt-1 max-w-[30ch] text-[12.5px] leading-snug text-foreground/80">
            You earned this stamp for checking in at this event. Collect more by
            attending events around you.
          </p>
        </DialogContent>
      )}
    </Dialog>
  );
}
