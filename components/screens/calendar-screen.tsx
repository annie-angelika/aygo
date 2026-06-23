"use client";

import { useState } from "react";

import { CalendarHero } from "@/components/discover/calendar-hero";
import { EventsBoard } from "@/components/discover/events-board";
import { findCalendar } from "@/lib/discover-data";

/** Community-calendar page: banner hero + the events board. */
export function CalendarScreen({ id }: { id: string }) {
  const calendar = findCalendar(id);
  const [following, setFollowing] = useState(false);

  if (!calendar) return null;

  return (
    <div className="flex flex-col gap-4 px-4 pt-3">
      <CalendarHero
        calendar={calendar}
        following={following}
        onToggleFollow={() => setFollowing((f) => !f)}
      />
      <EventsBoard />
    </div>
  );
}
