import { LuMapPin } from "react-icons/lu";

import { BackButton } from "@/components/ui/back-button";
import { EventsBoard } from "@/components/discover/events-board";
import { CATEGORIES } from "@/lib/events-data";
import { findCity } from "@/lib/cities-data";
import { cn } from "@/lib/utils";
import type { Category } from "@/types";

/**
 * Dedicated map view for a city (its own /<city>/map screen, Luma-style):
 * a slim header, then the map of events, the filter dropdowns and the list — all
 * from EventsBoard in map mode. Tapping a pin opens the event quick-preview.
 */
export function CityMapScreen({
  slug,
  initialInterest,
}: {
  slug: string;
  initialInterest?: string;
}) {
  const city = findCity(slug);
  if (!city) return null;

  const defaultInterest = (CATEGORIES as string[]).includes(initialInterest ?? "")
    ? (initialInterest as Category)
    : undefined;

  return (
    <div className="flex flex-col gap-4 px-4 pt-4">
      <header className="flex items-center gap-3">
        <BackButton className="ring-1 ring-border" />
        <span
          className={cn(
            "grid size-9 shrink-0 place-items-center rounded-xl text-white",
            city.tint,
          )}
          aria-hidden
        >
          <city.Icon className="size-[18px]" />
        </span>
        <div className="min-w-0">
          <h1 className="truncate text-[20px] font-semibold tracking-tight text-foreground">
            {city.name}
          </h1>
          <p className="flex items-center gap-1 text-[12.5px] text-muted-foreground">
            <LuMapPin className="size-3.5 shrink-0" aria-hidden />
            Events on the map
          </p>
        </div>
      </header>

      <EventsBoard
        view="map"
        city={city.name}
        country={city.country}
        defaultInterest={defaultInterest}
        hideHeading
      />
    </div>
  );
}
