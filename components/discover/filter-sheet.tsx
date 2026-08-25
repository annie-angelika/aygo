"use client";

// The "Filters" sheet for the Discover board: city, date range and price.
// Interest already has its own control next to the search box.

import { LuSlidersHorizontal } from "react-icons/lu";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { ChipGroup } from "@/components/ui/chip-group";
import { useCities } from "@/hooks/use-discover";
import {
  activeFilterCount,
  type DateRange,
  type ExtraFilters,
  type PriceFilter,
} from "@/hooks/use-event-filter";
import { cn } from "@/lib/utils";

const RANGES: { value: DateRange; label: string }[] = [
  { value: "any", label: "Any time" },
  { value: "today", label: "Today" },
  { value: "week", label: "This week" },
  { value: "month", label: "This month" },
];
const PRICES: { value: PriceFilter; label: string }[] = [
  { value: "any", label: "Any price" },
  { value: "free", label: "Free" },
  { value: "paid", label: "Paid" },
];

export function FilterSheet({
  value,
  onChange,
  onReset,
}: {
  value: ExtraFilters;
  onChange: (next: ExtraFilters) => void;
  onReset: () => void;
}) {
  const { cities } = useCities();
  const count = activeFilterCount(value);
  // Only cities that currently have upcoming events — a city with nothing to
  // show isn't a useful filter, and it keeps ~50 seed cities from becoming a
  // wall of chips. The one already selected stays even if it just emptied.
  const options = [
    { value: "all", label: "Anywhere" },
    ...cities
      .filter((c) => c.eventCount > 0 || c.name === value.city)
      .sort((a, b) => b.eventCount - a.eventCount || a.name.localeCompare(b.name))
      .map((c) => ({ value: c.name, label: `${c.name} · ${c.eventCount}` })),
  ];

  return (
    <Sheet>
      <SheetTrigger
        render={
          <Button
            variant="outline"
            size="sm"
            aria-label={count ? `Filters, ${count} active` : "Filters"}
            className={cn("h-9 gap-1.5 rounded-full bg-card px-3.5 text-[13px] font-semibold", count > 0 && "ring-2 ring-gold")}
          >
            <LuSlidersHorizontal className="size-4" aria-hidden />
            Filters
            {count > 0 && (
              <span className="grid size-4 place-items-center rounded-full bg-gold text-[9.5px] font-bold text-navy">
                {count}
              </span>
            )}
          </Button>
        }
      />
      <SheetContent className="gap-5 px-5 pt-3">
        <div>
          <SheetTitle>Filters</SheetTitle>
          <SheetDescription className="mt-0.5">
            Narrow the list to where, when and what it costs.
          </SheetDescription>
        </div>
        <div className="flex max-h-[55svh] flex-col gap-5 overflow-y-auto pb-1">
          <ChipGroup
            label="Where"
            value={value.city}
            options={options}
            onChange={(city) => onChange({ ...value, city })}
          />
          <ChipGroup
            label="When"
            value={value.range}
            options={RANGES}
            onChange={(range) => onChange({ ...value, range })}
          />
          <ChipGroup
            label="Price"
            value={value.price}
            options={PRICES}
            onChange={(price) => onChange({ ...value, price })}
          />
        </div>
        <Button variant="ghost" onClick={onReset} disabled={count === 0} className="h-10 rounded-full text-[13px] font-semibold">
          Clear filters
        </Button>
      </SheetContent>
    </Sheet>
  );
}
