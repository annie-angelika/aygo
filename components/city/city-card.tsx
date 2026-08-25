import Link from "next/link";

import { cn } from "@/lib/utils";
import type { City } from "@/lib/cities-data";

/**
 * Explorer tile: the city's landmark mark as a navy stamp (thin gold ring),
 * name and event count beneath. Cities with nothing on yet read as outlines.
 */
export function CityCard({ city }: { city: City }) {
  const empty = city.eventCount === 0;
  return (
    <Link
      href={`/${city.slug}`}
      className="group flex flex-col items-center gap-2 py-1.5"
    >
      <span
        className={cn(
          "grid size-[60px] place-items-center rounded-full outline outline-1 outline-offset-[3px] transition-transform group-hover:-translate-y-0.5",
          empty
            ? "bg-card text-foreground/45 outline-border"
            : "bg-primary text-cream outline-gold/80",
        )}
        aria-hidden
      >
        <city.Icon className="size-8" />
      </span>
      <div className="flex flex-col items-center gap-px">
        <p
          className={cn(
            "text-[12.5px] font-semibold",
            empty ? "text-muted-foreground" : "text-foreground",
          )}
        >
          {city.name}
        </p>
        <p className="text-[11px] text-muted-foreground">
          {empty
            ? "Coming soon"
            : `${city.eventCount} ${city.eventCount === 1 ? "event" : "events"}`}
        </p>
      </div>
    </Link>
  );
}
