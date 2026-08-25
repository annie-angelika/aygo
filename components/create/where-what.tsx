"use client";

import { useState } from "react";
import { LuAlignLeft } from "react-icons/lu";

import { CitySelect } from "@/components/create/city-select";
import { LocationField, type Coords, type LocationMeta } from "@/components/create/location-field";
import { DescriptionDialog } from "@/components/create/description-dialog";

/** City + location + description — the block below the date card. Location
 * and description share one white card, split by a hairline. */
export function WhereWhat({
  city,
  onCity,
  location,
  onLocationSelect,
  onNear,
  description,
  onDescription,
}: {
  city: string;
  onCity: (v: string) => void;
  location: string;
  onLocationSelect: (value: string, meta?: LocationMeta) => void;
  /** The device's position, once the host allows it (pre-picks the city). */
  onNear?: (coords: Coords) => void;
  description: string;
  onDescription: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="space-y-2">
      <CitySelect value={city} onChange={onCity} />

      <div className="rounded-2xl bg-card ring-1 ring-border">
        <LocationField value={location} city={city} onSelect={onLocationSelect} onNear={onNear} />
        <div className="mx-3 h-px bg-border" />
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="flex w-full items-start gap-3 rounded-b-2xl px-3.5 py-3 text-left transition-colors hover:bg-muted/40"
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
      </div>

      <DescriptionDialog
        open={open}
        onOpenChange={setOpen}
        value={description}
        onChange={onDescription}
      />
    </div>
  );
}
