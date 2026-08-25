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
  defaultInterest,
  filterCity,
  category,
}: {
  logo: React.ReactNode;
  title: string;
  /** Fallback map center when no event is geocoded yet. */
  city: string;
  defaultInterest?: Category;
  /** Scope the list/map to one city's events (city map pages). */
  filterCity?: string;
  /** Lock the list/map to one interest (calendar map pages). */
  category?: Category;
}) {
  const { isGoing } = useRegistrations();
  const { loading, when, setWhen, interest, setInterest, filtered } =
    useEventFilter({ defaultInterest, city: filterCity, category });

  return (
    // Desktop (`lg`): a two-column grid — the map fills the left column's full
    // height; the identity header, the filters and the scrolling list stack on
    // the right. The phone's pinned block dissolves (`lg:contents`) so its
    // children become grid items placed by the classes below; the filters (no
    // className of their own) auto-place into the remaining right-column cell.
    <main className="mx-auto flex h-svh w-full max-w-md flex-col bg-background lg:grid lg:max-w-6xl lg:grid-cols-[minmax(0,1fr)_460px] lg:grid-rows-[auto_auto_minmax(0,1fr)] lg:gap-x-8 lg:gap-y-4 lg:px-4 lg:py-4">
      <div className="flex shrink-0 flex-col gap-3 border-b border-border px-4 pb-3 pt-4 lg:contents">
        <header className="flex items-center gap-3 lg:col-start-2 lg:row-start-1">
          <BackButton className="bg-card ring-1 ring-border hover:bg-secondary/60" />
          {logo}
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-[20px] font-bold tracking-[-0.03em] text-foreground">
              {title}
            </h1>
          </div>
          {/* Brand mark anchored top-right, Luma-style. */}
          <Logo className="shrink-0" />
        </header>

        {/* Map runs edge-to-edge: break out of the header's px-4 and drop the
            side rounding/ring so it reaches both lateral borders. On desktop it
            is a rounded card spanning every row of the left column. */}
        <div className="lg:col-start-1 lg:row-span-full lg:row-start-1 lg:min-h-0">
          <EventsMap
            events={filtered}
            city={city}
            className="-mx-4 h-[240px] rounded-none ring-0 lg:mx-0 lg:h-full lg:rounded-3xl lg:ring-1"
          />
        </div>

        <EventsFilters
          variant="dropdowns"
          when={when}
          onWhenChange={setWhen}
          interest={interest}
          onInterestChange={setInterest}
          showInterest
        />
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-16 lg:col-start-2 lg:row-start-3 lg:px-0 lg:pb-4">
        {!loading && filtered.length > 0 && (
          <EventTimeline events={filtered} isGoing={isGoing} stickyOffset="top-0" />
        )}
      </div>
    </main>
  );
}
