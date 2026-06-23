"use client";

import { useRegistrations } from "@/hooks/use-registrations";
import { useEventFilter } from "@/hooks/use-event-filter";
import { Logo } from "@/components/layout/logo";
import { BackButton } from "@/components/ui/back-button";
import { EventTimeline } from "@/components/event/event-timeline";
import { EventsMap } from "@/components/discover/events-map";
import { EventsFilters } from "@/components/discover/events-filters";
import type { Category } from "@/types";

/**
 * Dedicated, immersive map view (Luma-style /<slug>/map). The identity header,
 * the map and the filter dropdowns stay pinned at the top; only the event list
 * scrolls beneath them, and its date headers stick so you always know which day
 * an event belongs to — even on a busy day with many events. Callers supply the
 * `logo` + `title` and the map center (`city`/`country`).
 */
export function MapScreen({
  logo,
  title,
  city,
  country,
  defaultInterest,
}: {
  logo: React.ReactNode;
  title: string;
  city: string;
  country?: string;
  defaultInterest?: Category;
}) {
  const { isGoing } = useRegistrations();
  const { loading, when, setWhen, interest, setInterest, filtered } =
    useEventFilter({ defaultInterest });

  return (
    <main className="mx-auto flex h-svh w-full max-w-md flex-col bg-background">
      <div className="flex shrink-0 flex-col gap-3 border-b border-border px-4 pb-3 pt-4">
        <header className="flex items-center gap-3">
          <BackButton className="ring-1 ring-border" />
          {logo}
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-[20px] font-semibold tracking-tight text-foreground">
              {title}
            </h1>
          </div>
          {/* Brand mark anchored top-right, Luma-style. */}
          <Logo className="shrink-0" />
        </header>

        {/* Map runs edge-to-edge: break out of the header's px-4 and drop the
            side rounding/ring so it reaches both lateral borders. */}
        <EventsMap
          events={filtered}
          city={city}
          country={country ?? ""}
          className="-mx-4 h-[240px] rounded-none ring-0"
        />

        <EventsFilters
          variant="dropdowns"
          when={when}
          onWhenChange={setWhen}
          interest={interest}
          onInterestChange={setInterest}
          showInterest
        />
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-16">
        {!loading && filtered.length > 0 && (
          <EventTimeline events={filtered} isGoing={isGoing} stickyOffset="top-0" />
        )}
      </div>
    </main>
  );
}
