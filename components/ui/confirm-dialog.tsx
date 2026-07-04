"use client";

// A destructive-action gate: trigger → "are you sure?" dialog → onConfirm.
// Generic on purpose (no domain types) — reused for delete event, remove guest…

import { useState, type ReactElement } from "react";

import {
  Dialog,
  DialogTrigger,
  DialogClose,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export function ConfirmDialog({
  trigger,
  title,
  description,
  confirmLabel,
  busyLabel,
  onConfirm,
}: {
  /** The element that opens the dialog (Base UI `render` slot). */
  trigger: ReactElement<Record<string, unknown>>;
  title: string;
  description: string;
  confirmLabel: string;
  busyLabel: string;
  /** Runs on confirm; throw to keep the dialog open with an error. */
  onConfirm: () => Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function confirm() {
    setBusy(true);
    setError(null);
    try {
      await onConfirm();
      setOpen(false);
    } catch {
      setError("Something went wrong — check your connection and try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={trigger} />
      <DialogContent className="gap-4">
        <div>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription className="mt-1 leading-snug">
            {description}
          </DialogDescription>
        </div>
        {error && (
          <p className="text-[12px] font-medium text-destructive">{error}</p>
        )}
        <div className="grid grid-cols-2 gap-2">
          <DialogClose
            render={
              <Button
                type="button"
                variant="outline"
                className="h-11 rounded-xl text-[13.5px]"
              >
                Cancel
              </Button>
            }
          />
          <Button
            type="button"
            variant="destructive"
            disabled={busy}
            onClick={() => void confirm()}
            className="h-11 rounded-xl text-[13.5px]"
          >
            {busy ? busyLabel : confirmLabel}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
