"use client";

import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { CategoryChip } from "@/components/event/category-chip";
import { CATEGORY_META } from "@/lib/events-data";
import { cn } from "@/lib/utils";
import type { Stamp } from "@/types";

/** Detail of a single aygo — its mark, name, category and when you earned it. */
export function StampModal({
  stamp,
  dateLabel,
  onClose,
}: {
  stamp: Stamp | null;
  dateLabel?: string;
  onClose: () => void;
}) {
  const meta = stamp ? CATEGORY_META[stamp.category] : undefined;

  return (
    <Dialog open={!!stamp} onOpenChange={(open) => !open && onClose()}>
      {stamp && meta && (
        <DialogContent className="justify-items-center gap-3 text-center">
          <div
            className={cn(
              "grid size-24 place-items-center rounded-full bg-card shadow-sm ring-1 ring-border",
              meta.accent,
            )}
          >
            <meta.Icon className="size-11" aria-hidden />
          </div>

          <div className="flex flex-col items-center gap-2">
            <DialogTitle className="text-[18px]">{stamp.title}</DialogTitle>
            <CategoryChip category={stamp.category} />
          </div>

          {dateLabel && (
            <p className="text-[12.5px] font-medium text-muted-foreground">
              Collected in {dateLabel}
            </p>
          )}

          <DialogDescription className="max-w-[30ch] text-[12.5px] leading-snug">
            An aygo you earned for showing up. Collect more by attending events
            around you.
          </DialogDescription>
        </DialogContent>
      )}
    </Dialog>
  );
}
