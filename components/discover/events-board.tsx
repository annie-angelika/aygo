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
 * The "Events" block shared by city, calendar, and category pages: Upcoming/Past
 * + interest filters and the date-grouped timeline with its three states.
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
}: {
  category?: Category;
  defaultInterest?: Category;
  upcomingOnly?: boolean;
}) {
  const { isGoing } = useRegistrations();
  const { loading, when, setWhen, interest, setInterest, past, active, filtered } =
    useEventFilter({ category, defaultInterest, upcomingOnly });

  return (
    <div className="flex flex-col gap-4">
      <div className="pt-1">
        <h2 className="text-[17px] font-semibold tracking-tight text-foreground">
          {upcomingOnly ? "Upcoming events" : "Events"}
        </h2>
      </div>

      {!upcomingOnly && (
        <EventsFilters
          variant="tabs"
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
          stickyOffset="top-14"
        />
      )}
    </div>
  );
}
