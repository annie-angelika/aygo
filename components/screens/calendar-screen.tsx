"use client";

import { useState } from "react";

import { CalendarHero } from "@/components/discover/calendar-hero";
import { EventsBoard } from "@/components/discover/events-board";
import { findCalendar } from "@/lib/discover-data";
import { useCalendars } from "@/hooks/use-discover";

/**
 * Community-calendar page: banner hero + the events board, scoped to the
 * calendar's interest. Identity renders instantly from the seed; the live row
 * from the backend replaces it once loaded.
 */
export function CalendarScreen({ id }: { id: string }) {
  const { calendars } = useCalendars();
  const calendar = calendars.find((c) => c.id === id) ?? findCalendar(id);
  const [following, setFollowing] = useState(false);

  if (!calendar) return null;

  return (
    <div className="flex flex-col gap-4 px-4 pt-3">
      <CalendarHero
        calendar={calendar}
        following={following}
        onToggleFollow={() => setFollowing((f) => !f)}
      />
      <EventsBoard category={calendar.category} />
    </div>
  );
}
