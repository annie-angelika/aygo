"use client";

import { useState } from "react";
import { LuAlignLeft } from "react-icons/lu";

import { LocationField } from "@/components/create/location-field";
import { DescriptionDialog } from "@/components/create/description-dialog";

/** Location + description — the two rows below the date block. */
export function WhereWhat({
  location,
  onLocation,
  description,
  onDescription,
}: {
  location: string;
  onLocation: (v: string) => void;
  description: string;
  onDescription: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="space-y-2">
      <LocationField value={location} onChange={onLocation} />

      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex w-full items-start gap-3 rounded-2xl bg-muted px-3.5 py-3 text-left ring-1 ring-border transition-colors hover:bg-muted/70"
      >
        <LuAlignLeft className="mt-0.5 size-[18px] shrink-0 text-muted-foreground" aria-hidden />
        {description ? (
          <span className="line-clamp-3 min-w-0 flex-1 text-[14px] leading-snug text-foreground">
            {description}
          </span>
        ) : (
          <span className="text-[14px] font-medium text-muted-foreground">Add Description</span>
        )}
      </button>

      <DescriptionDialog
        open={open}
        onOpenChange={setOpen}
        value={description}
        onChange={onDescription}
      />
    </div>
  );
}
