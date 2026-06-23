"use client";

import { useState } from "react";
import { LuUpload, LuSearch } from "react-icons/lu";

import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { STOCK_COVERS } from "@/lib/create-event";

const CHIPS = ["Featured", "Cup", "Sports", "Spring", "July 4th", "Climate"];

/** "Choose Image" modal — upload tile, search, chips, and a grid of covers. */
export function ImagePickerDialog({
  open,
  onOpenChange,
  onSelect,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (src: string) => void;
}) {
  const [active, setActive] = useState("Featured");

  function pick(src: string) {
    onSelect(src);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="gap-0 p-0">
        <div className="flex max-h-[80vh] flex-col">
          <div className="px-5 pt-7 text-center">
            <DialogTitle>Choose Image</DialogTitle>
            <DialogDescription className="mt-1">
              Tap to upload. The ideal aspect ratio is 1:1.
            </DialogDescription>
          </div>

          <div className="space-y-3 px-5 pt-4">
            <button
              type="button"
              onClick={() => pick(STOCK_COVERS[0])}
              className="flex w-full flex-col items-center gap-1.5 rounded-2xl border border-dashed border-border bg-background py-6 text-muted-foreground transition-colors hover:bg-muted"
            >
              <LuUpload className="size-5" aria-hidden />
              <span className="text-[12.5px] font-medium">Tap here to upload</span>
            </button>

            <div className="flex items-center gap-2 rounded-xl bg-background px-3 ring-1 ring-border">
              <LuSearch className="size-4 shrink-0 text-muted-foreground" aria-hidden />
              <input
                placeholder="Search for more photos"
                className="h-9 w-full bg-transparent text-[13px] text-foreground outline-none placeholder:text-muted-foreground"
              />
            </div>

            <div className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-1 no-scrollbar">
              {CHIPS.map((chip) => (
                <button
                  key={chip}
                  type="button"
                  onClick={() => setActive(chip)}
                  className={
                    "shrink-0 rounded-full px-3 py-1.5 text-[12px] font-medium transition-colors " +
                    (active === chip
                      ? "bg-foreground text-background"
                      : "bg-muted text-muted-foreground hover:text-foreground")
                  }
                >
                  {chip}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 overflow-y-auto px-5 pb-6 pt-3">
            {STOCK_COVERS.map((src) => (
              <button
                key={src}
                type="button"
                onClick={() => pick(src)}
                className="aspect-square overflow-hidden rounded-xl ring-1 ring-border transition-transform active:scale-95"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={src} alt="" className="size-full object-cover" />
              </button>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
