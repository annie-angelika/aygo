"use client";

import { CalendarHero } from "@/components/discover/calendar-hero";
import { EventsBoard } from "@/components/discover/events-board";
import { useCalendars } from "@/hooks/use-discover";
import type { CalendarInfo } from "@/types";

/**
 * Community-calendar page: banner hero + the events board, scoped to the
 * calendar's interest. `initial` is the row the server resolved, so the page
 * renders at once; the live list (with any admin edits) replaces it once loaded.
 */
export function CalendarScreen({
  id,
  initial,
}: {
  id: string;
  initial?: CalendarInfo;
}) {
  const { calendars } = useCalendars();
  const calendar = calendars.find((c) => c.id === id) ?? initial;

  if (!calendar) return null;

  return (
    <div className="flex flex-col gap-4 px-4 pt-3 lg:gap-8 lg:pt-4">
      <CalendarHero calendar={calendar} />
      <EventsBoard category={calendar.category} />
    </div>
  );
}
