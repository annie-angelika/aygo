"use client";

import { LuSparkles } from "react-icons/lu";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

// A stand-in "AI" draft so the Suggest button does something useful without a
// real model wired up. Swap for a real completion when the backend lands.
const SUGGESTION =
  "Join us for an unforgettable evening. Expect great company, good music, and a few surprises along the way. Come as you are — we saved you a spot.";

/**
 * "Event Description" modal — a focused space to write the blurb (with a mocked
 * "Suggest with AI" helper). Always the app font: the published event page
 * renders the blurb in the default face, so previewing the theme font here
 * would be a lie (and read as broken).
 */
export function DescriptionDialog({
  open,
  onOpenChange,
  value,
  onChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="gap-0 p-0">
        <div className="flex max-h-[80vh] flex-col">
          <div className="px-5 pt-6">
            <DialogTitle>Event Description</DialogTitle>
          </div>

          <textarea
            autoFocus
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="What's the event about?"
            className="mt-3 min-h-[220px] flex-1 resize-none bg-transparent px-5 text-[16px] leading-relaxed text-foreground outline-none placeholder:text-muted-foreground"
          />

          <div className="flex items-center justify-between gap-3 px-5 pb-5 pt-3">
            <button
              type="button"
              onClick={() => onChange(SUGGESTION)}
              className="flex items-center gap-1.5 rounded-full px-2 py-1 text-[13px] font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              <LuSparkles className="size-4 text-gold-deep" aria-hidden />
              Suggest with AI
            </button>
            <Button onClick={() => onOpenChange(false)} className="rounded-full px-6">
              Done
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
