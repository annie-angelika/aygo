"use client";

import { useState } from "react";
import { LuCalendarX } from "react-icons/lu";

import { useEvents } from "@/hooks/use-events";
import { useRegistrations } from "@/hooks/use-registrations";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { EventTimeline } from "@/components/event/event-timeline";
import { EventsFilters } from "@/components/discover/events-filters";
import { EventsMap } from "@/components/discover/events-map";
import type { Category } from "@/types";

type When = "upcoming" | "past";

/**
 * The "Events" block shared by city, calendar, and category pages: Upcoming/Past
 * + interest filters and the date-grouped timeline with its three states.
 * Pass `category` to lock the board to one interest and hide the filter (used by
 * category pages); pass `defaultInterest` to preselect a still-changeable filter.
 *
 * `upcomingOnly` is the agenda variant for category pages: it drops the filters
 * and the Submit action, shows only what's coming, and groups by month.
 *
 * `view="map"` (city pages) renders a map of the filtered events above the list,
 * with the filters shown as dropdowns; `city`/`country` center that map.
 */
export function EventsBoard({
  category,
  defaultInterest,
  upcomingOnly,
  view = "list",
  city,
  country,
  hideHeading,
}: {
  category?: Category;
  defaultInterest?: Category;
  upcomingOnly?: boolean;
  view?: "list" | "map";
  city?: string;
  country?: string;
  /** Drop the "Events" title when the surrounding screen already has a header. */
  hideHeading?: boolean;
}) {
  const { data, loading } = useEvents();
  const { isGoing } = useRegistrations();
  const [when, setWhen] = useState<When>("upcoming");
  const [interest, setInterest] = useState<Category | "all">(
    category ?? defaultInterest ?? "all",
  );

  const past = !upcomingOnly && when === "past";
  const active = category ?? interest;
  const filtered = data
    .filter((e) => (past ? e.isPast : !e.isPast))
    .filter((e) => active === "all" || e.category === active)
    .sort((a, b) =>
      past
        ? b.startsAt.localeCompare(a.startsAt)
        : a.startsAt.localeCompare(b.startsAt),
    );

  const isMap = view === "map" && Boolean(city);

  return (
    <div className="flex flex-col gap-4">
      {!hideHeading && (
        <div className="pt-1">
          <h2 className="text-[17px] font-semibold tracking-tight text-foreground">
            {upcomingOnly ? "Upcoming events" : "Events"}
          </h2>
        </div>
      )}

      {isMap && !loading && (
        <EventsMap events={filtered} city={city!} country={country ?? ""} />
      )}

      {!upcomingOnly && (
        <EventsFilters
          variant={isMap ? "dropdowns" : "tabs"}
          when={when}
          onWhenChange={setWhen}
          interest={interest}
          onInterestChange={setInterest}
          showInterest={!category}
        />
      )}

      {loading ? (
        <div className="flex flex-col gap-3 pt-2">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={LuCalendarX}
          title="Nothing here yet"
          subtitle={
            active === "all"
              ? "More events are on the way."
              : `No ${active} events ${past ? "in the past" : "right now"}.`
          }
        />
      ) : (
        <EventTimeline
          events={filtered}
          isGoing={isGoing}
          groupBy={upcomingOnly ? "month" : "day"}
        />
      )}
    </div>
  );
}
