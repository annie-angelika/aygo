"use client";

import { LuCalendar } from "react-icons/lu";

import {
  Dialog,
  DialogContent,
  DialogClose,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AygoStamp } from "@/components/passport/aygo-stamp";
import { CategoryChip } from "@/components/event/category-chip";
import type { Stamp } from "@/types";

/** Detail of a single aygo — the stamp up close, its name, category and when you earned it. */
export function StampModal({
  stamp,
  dateLabel,
  onClose,
}: {
  stamp: Stamp | null;
  dateLabel?: string;
  onClose: () => void;
}) {
  return (
    <Dialog open={!!stamp} onOpenChange={(open) => !open && onClose()}>
      {stamp && (
        <DialogContent className="gap-0 overflow-hidden p-0">
          {/* The stamp sits on a band of cream paper, like a page of the passport. */}
          <div className="grid place-items-center bg-contour px-6 pb-7 pt-10">
            <AygoStamp
              stamp={stamp}
              dateLabel={dateLabel}
              size="lg"
              className="w-44"
            />
          </div>

          <div className="flex flex-col items-center px-6 pb-6 pt-5 text-center">
            <DialogTitle className="text-[20px] font-bold tracking-[-0.03em]">
              {stamp.title}
            </DialogTitle>
            <CategoryChip category={stamp.category} className="mt-2" />

            {dateLabel && (
              <p className="mt-3 inline-flex items-center gap-1.5 text-[12px] font-medium text-muted-foreground">
                <LuCalendar className="size-3.5" aria-hidden />
                Collected in {dateLabel}
              </p>
            )}

            <DialogDescription className="mt-2.5 max-w-[32ch] text-[12.5px] leading-snug">
              An aygo you earned for showing up. Collect more by attending events
              around you.
            </DialogDescription>

            <DialogClose
              render={
                <Button
                  size="lg"
                  className="mt-5 h-12 w-full rounded-full text-[14px] font-semibold"
                >
                  Done
                </Button>
              }
            />
          </div>
        </DialogContent>
      )}
    </Dialog>
  );
}
