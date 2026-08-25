"use client";

import { useState } from "react";

import { CollectSheet } from "@/components/passport/collect-sheet";
import { AygoStar } from "@/components/ui/brand-icons";

/**
 * The "Collect" action: a navy pill pinned to the bottom-right of the phone
 * frame that opens the QR check-in. One method, the real one.
 */
export function CollectFab() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="pointer-events-none fixed inset-x-0 bottom-5 z-50 mx-auto flex w-full max-w-md justify-end px-4 lg:max-w-6xl lg:px-8">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="pointer-events-auto inline-flex h-12 items-center gap-2 rounded-full bg-primary pl-3.5 pr-[18px] text-[14px] font-semibold text-primary-foreground shadow-[0_12px_24px_-12px_rgba(9,25,53,0.6)] outline-none transition-colors hover:bg-primary/90 focus-visible:ring-2 focus-visible:ring-ring active:translate-y-px"
        >
          <AygoStar className="size-[18px] text-gold" />
          Collect
        </button>
      </div>

      <CollectSheet open={open} onClose={() => setOpen(false)} />
    </>
  );
}
