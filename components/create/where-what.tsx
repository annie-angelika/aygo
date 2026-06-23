"use client";

import { LuAlignLeft } from "react-icons/lu";

import { LocationField } from "@/components/create/location-field";

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
  return (
    <div className="space-y-2">
      <LocationField value={location} onChange={onLocation} />

      <label className="flex items-start gap-3 rounded-2xl bg-muted px-3.5 py-3 ring-1 ring-border focus-within:ring-2 focus-within:ring-ring">
        <LuAlignLeft className="mt-0.5 size-[18px] shrink-0 text-muted-foreground" aria-hidden />
        <textarea
          value={description}
          onChange={(e) => onDescription(e.target.value)}
          rows={description ? 4 : 1}
          placeholder="Add Description"
          className="min-h-0 w-full resize-none bg-transparent text-[14px] font-medium leading-snug text-foreground outline-none placeholder:text-muted-foreground"
        />
      </label>
    </div>
  );
}
