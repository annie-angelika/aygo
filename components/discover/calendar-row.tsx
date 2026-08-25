"use client";

// The "Featured calendars" section, fed from the backend's calendars table
// (`useCalendars`, curated in the admin). Skeleton cards hold the layout on the
// first uncached load; with nothing curated yet the whole section stays out.

import { CalendarCard } from "@/components/discover/calendar-card";
import { SectionTitle } from "@/components/ui/section-title";
import { Skeleton } from "@/components/ui/skeleton";
import { useCalendars } from "@/hooks/use-discover";

export function CalendarRow() {
  const { calendars, loading } = useCalendars();
  if (!loading && calendars.length === 0) return null;

  return (
    <section>
      <SectionTitle>Featured calendars</SectionTitle>
      <div className="no-scrollbar -mx-4 overflow-x-auto pb-1 lg:mx-0 lg:overflow-visible">
        <div className="flex gap-3 px-4 lg:grid lg:grid-cols-4 lg:px-0">
          {loading && calendars.length === 0
            ? [0, 1].map((i) => (
                <Skeleton key={i} className="h-44 w-64 shrink-0 rounded-2xl" />
              ))
            : calendars.map((cal) => (
                <CalendarCard key={cal.id} calendar={cal} />
              ))}
        </div>
      </div>
    </section>
  );
}
