"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

/**
 * "Event Description" modal — a focused space to write the blurb. Always the app
 * font: the published event page renders the blurb in the default face, so
 * previewing the theme font here would be a lie (and read as broken).
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

          <div className="flex items-center justify-end gap-3 px-5 pb-5 pt-3">
            <Button onClick={() => onOpenChange(false)} className="rounded-full px-6">
              Done
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
