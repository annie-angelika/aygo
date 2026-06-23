import { EventRow } from "@/components/event/event-row";
import { DateGroup } from "@/components/event/date-group";
import type { AygoEvent } from "@/types";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

type Group = {
  key: string;
  label: string;
  weekday?: string;
  events: AygoEvent[];
};

/** Groups events under their day header, preserving incoming order. */
function groupByDay(list: AygoEvent[]): Group[] {
  const groups: Group[] = [];
  for (const e of list) {
    let g = groups.find((x) => x.key === e.dayKey);
    if (!g) {
      g = { key: e.dayKey, label: e.dayLabel, weekday: e.weekday, events: [] };
      groups.push(g);
    }
    g.events.push(e);
  }
  return groups;
}

/** Groups events under their month header (e.g. "June"), order preserved. */
function groupByMonth(list: AygoEvent[]): Group[] {
  const groups: Group[] = [];
  for (const e of list) {
    const key = e.startsAt.slice(0, 7); // YYYY-MM
    let g = groups.find((x) => x.key === key);
    if (!g) {
      const month = Number(key.slice(5, 7)) - 1;
      g = { key, label: MONTHS[month] ?? key, events: [] };
      groups.push(g);
    }
    g.events.push(e);
  }
  return groups;
}

/**
 * Luma-style grouped event timeline. `groupBy="day"` (default) headers each day;
 * `groupBy="month"` collapses to month headers for sparser agenda views.
 */
export function EventTimeline({
  events,
  isGoing,
  groupBy = "day",
  stickyOffset = "top-0",
}: {
  events: AygoEvent[];
  isGoing?: (id: string) => boolean;
  groupBy?: "day" | "month";
  /** Sticky top inset for the date headers (Tailwind `top-*`). */
  stickyOffset?: string;
}) {
  const groups = groupBy === "month" ? groupByMonth(events) : groupByDay(events);
  return (
    <div className="flex flex-col gap-6 pt-1">
      {groups.map((g) => (
        <DateGroup
          key={g.key}
          label={g.label}
          weekday={g.weekday}
          offset={stickyOffset}
        >
          {g.events.map((e) => (
            <EventRow key={e.id} event={e} going={isGoing?.(e.id)} />
          ))}
        </DateGroup>
      ))}
    </div>
  );
}
