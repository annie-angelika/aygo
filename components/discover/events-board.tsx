"use client";

import { LuCalendarX } from "react-icons/lu";

import { useRegistrations } from "@/hooks/use-registrations";
import { useEventFilter } from "@/hooks/use-event-filter";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { EventTimeline } from "@/components/event/event-timeline";
import { EventsFilters } from "@/components/discover/events-filters";
import type { Category } from "@/types";

/**
 * The "Events" block shared by city, calendar, and category pages: interest
 * chips, a "Food · 3 events" heading with Upcoming/Past at its right, and the
 * date-grouped timeline with its three states.
 * Pass `category` to lock the board to one interest and hide the filter (used by
 * category pages); pass `defaultInterest` to preselect a still-changeable filter.
 *
 * `upcomingOnly` is the agenda variant for category pages: it drops the filters
 * and the Submit action, shows only what's coming, and groups by month.
 */
export function EventsBoard({
  category,
  defaultInterest,
  upcomingOnly,
  city,
}: {
  category?: Category;
  defaultInterest?: Category;
  upcomingOnly?: boolean;
  /** Scope the board to one city's events (city pages). */
  city?: string;
}) {
  const { isGoing } = useRegistrations();
  const { loading, when, setWhen, interest, setInterest, past, active, filtered } =
    useEventFilter({ category, defaultInterest, upcomingOnly, city });

  const heading = (
    <h2 className="inline-flex min-w-0 items-center gap-2 text-[17px] font-semibold tracking-[-0.01em] text-foreground lg:text-[20px]">
      <span className="truncate">
        {upcomingOnly ? "Upcoming events" : active === "all" ? "All" : active}
      </span>
      {!loading && (
        <span className="shrink-0 text-[13px] font-medium text-muted-foreground">
          {filtered.length} {filtered.length === 1 ? "event" : "events"}
        </span>
      )}
    </h2>
  );

  return (
    <div className="@container flex flex-col gap-4">
      {upcomingOnly ? (
        <div className="pt-1">{heading}</div>
      ) : (
        <EventsFilters
          variant="tabs"
          when={when}
          onWhenChange={setWhen}
          interest={interest}
          onInterestChange={setInterest}
          showInterest={!category}
          leading={heading}
        />
      )}

      {loading ? (
        <div className="grid gap-3 pt-2 @2xl:grid-cols-2">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-28 rounded-[18px]" />
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
          stickyOffset="top-14"
        />
      )}
    </div>
  );
}
