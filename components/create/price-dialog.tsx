"use client";

import { useState } from "react";
import { LuTicket } from "react-icons/lu";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";

/** "Ticket Price" modal — free, or a price in Bs the guest pays the host directly. */
export function PriceDialog({
  open,
  onOpenChange,
  price,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  price: number | null;
  onConfirm: (price: number | null) => void;
}) {
  const [paid, setPaid] = useState(price != null && price > 0);
  const [value, setValue] = useState(price != null && price > 0 ? String(price) : "50");

  function confirm() {
    const n = Number(value);
    onConfirm(paid && Number.isFinite(n) && n > 0 ? Math.round(n * 100) / 100 : null);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <span className="grid size-12 place-items-center rounded-full bg-muted text-foreground">
          <LuTicket className="size-5" aria-hidden />
        </span>
        <div>
          <DialogTitle className="text-[18px]">Ticket Price</DialogTitle>
          <DialogDescription className="mt-1.5">
            Guests pay you directly (at the door or however you arrange it) —
            aygo doesn&apos;t process payments yet. The price shows on your event page.
          </DialogDescription>
        </div>

        <div className="flex items-center justify-between gap-3">
          <span className="text-[14px] font-medium text-foreground">Paid event</span>
          <Switch checked={paid} onCheckedChange={setPaid} />
        </div>

        {paid && (
          <div className="flex items-center gap-2">
            <span className="text-[14px] font-semibold text-muted-foreground">Bs</span>
            <Input
              type="number"
              min={1}
              step="0.5"
              inputMode="decimal"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="Price"
              className="h-11"
            />
          </div>
        )}

        <Button size="lg" onClick={confirm} className="h-12 w-full rounded-full text-[14px]">
          Confirm
        </Button>
      </DialogContent>
    </Dialog>
  );
}
