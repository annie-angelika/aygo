"use client";

// The "Featured calendars" scroll row, fed from the backend's calendars table
// (`useCalendars`). Skeleton cards hold the layout on the first uncached load.

import { CalendarCard } from "@/components/discover/calendar-card";
import { Skeleton } from "@/components/ui/skeleton";
import { useCalendars } from "@/hooks/use-discover";

export function CalendarRow() {
  const { calendars, loading } = useCalendars();

  return (
    <div className="no-scrollbar -mx-4 overflow-x-auto pb-1">
      <div className="flex gap-3 px-4">
        {loading && calendars.length === 0
          ? [0, 1].map((i) => (
              <Skeleton key={i} className="h-44 w-64 shrink-0 rounded-2xl" />
            ))
          : calendars.map((cal) => <CalendarCard key={cal.id} calendar={cal} />)}
      </div>
    </div>
  );
}
