"use client";

import { useState } from "react";
import { LuArrowUpFromLine } from "react-icons/lu";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";

/** "Max Capacity" modal — toggle a limit and set the number of approved spots. */
export function CapacityDialog({
  open,
  onOpenChange,
  capacity,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  capacity: number | null;
  onConfirm: (capacity: number | null) => void;
}) {
  const [limited, setLimited] = useState(capacity != null);
  const [value, setValue] = useState(capacity != null ? String(capacity) : "50");

  function confirm() {
    const n = Number(value);
    onConfirm(limited && n > 0 ? n : null);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <span className="grid size-12 place-items-center rounded-full bg-muted text-foreground">
          <LuArrowUpFromLine className="size-5" aria-hidden />
        </span>
        <div>
          <DialogTitle className="text-[18px]">Max Capacity</DialogTitle>
          <DialogDescription className="mt-1.5">
            Close registration when reaching the capacity. Only approved guests
            count towards it.
          </DialogDescription>
        </div>

        <div className="flex items-center justify-between gap-3">
          <span className="text-[14px] font-medium text-foreground">
            Limit Event Capacity
          </span>
          <Switch checked={limited} onCheckedChange={setLimited} />
        </div>

        {limited && (
          <Input
            type="number"
            min={1}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Capacity"
            className="h-11"
          />
        )}

        <Button size="lg" onClick={confirm} className="h-12 w-full rounded-full text-[14px]">
          Confirm
        </Button>
      </DialogContent>
    </Dialog>
  );
}
