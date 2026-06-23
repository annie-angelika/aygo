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
import { AygoArt } from "@/components/passport/aygo-art";
import { CategoryChip } from "@/components/event/category-chip";
import { CATEGORY_META } from "@/lib/events-data";
import { cn } from "@/lib/utils";
import type { Stamp } from "@/types";

/** Detail of a single aygo — its artwork, name, category and when you earned it. */
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
        <DialogContent className="gap-0 overflow-hidden p-0">
          <div className="relative flex flex-col items-center px-6 pb-6 pt-9 text-center">
            {/* A soft, category-tinted aura behind the artwork for depth. */}
            <div
              aria-hidden
              className={cn(
                "pointer-events-none absolute left-1/2 top-4 size-44 -translate-x-1/2 rounded-full opacity-70 blur-3xl",
                meta.chip,
              )}
            />

            {/* The aygo artwork, floating on its ring. */}
            <div className="relative size-28 overflow-hidden rounded-full bg-card shadow-[0_16px_36px_-16px_rgba(15,23,42,0.45)] ring-4 ring-background">
              <AygoArt
                image={stamp.image}
                blurDataURL={stamp.blurDataURL}
                alt={stamp.title}
                sizes="112px"
                spinnerClassName="size-6"
                fallback={
                  <span
                    className={cn(
                      "grid size-full place-items-center",
                      meta.soft,
                      meta.accent,
                    )}
                  >
                    <meta.Icon className="size-12" aria-hidden />
                  </span>
                }
              />
            </div>

            <DialogTitle className="relative mt-4 text-[20px]">
              {stamp.title}
            </DialogTitle>
            <CategoryChip category={stamp.category} className="relative mt-2" />

            {dateLabel && (
              <p className="relative mt-3 inline-flex items-center gap-1.5 text-[12px] font-medium text-muted-foreground">
                <LuCalendar className="size-3.5" aria-hidden />
                Collected in {dateLabel}
              </p>
            )}

            <DialogDescription className="relative mt-2.5 max-w-[32ch] text-[12.5px] leading-snug">
              An aygo you earned for showing up. Collect more by attending events
              around you.
            </DialogDescription>

            <DialogClose
              render={
                <Button
                  size="lg"
                  className="relative mt-5 h-10 w-full rounded-full text-[14px]"
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
