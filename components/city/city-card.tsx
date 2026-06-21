import Link from "next/link";

import { cn } from "@/lib/utils";
import type { City } from "@/lib/cities-data";

/** Explorer tile: round landmark icon + city name and event/subscription hint. */
export function CityCard({ city }: { city: City }) {
  return (
    <Link
      href={`/discover/${city.slug}`}
      className="flex items-center gap-3 rounded-2xl p-2 transition-colors hover:bg-accent/40"
    >
      <span
        className={cn(
          "grid size-12 shrink-0 place-items-center rounded-full text-white",
          city.tint,
        )}
        aria-hidden
      >
        <city.Icon className="size-6" />
      </span>
      <div className="min-w-0">
        <p className="truncate text-[15px] font-semibold text-foreground">
          {city.name}
        </p>
        <p className="truncate text-[12.5px] text-muted-foreground">
          {city.subscribed ? (
            <span className="inline-flex items-center gap-1">
              <span className="size-1.5 rounded-full bg-amber-500" aria-hidden />
              Subscribed
            </span>
          ) : (
            `${city.eventCount} events`
          )}
        </p>
      </div>
    </Link>
  );
}
