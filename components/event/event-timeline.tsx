import { EventRow } from "@/components/event/event-row";
import { DateGroup } from "@/components/event/date-group";
import type { AygoEvent } from "@/types";

/** Groups events under their day header, preserving incoming order. */
function groupByDay(list: AygoEvent[]) {
  const groups: {
    key: string;
    label: string;
    weekday: string;
    events: AygoEvent[];
  }[] = [];
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

/** Luma-style date-grouped event timeline. Shared by Home and Discover. */
export function EventTimeline({
  events,
  isGoing,
}: {
  events: AygoEvent[];
  isGoing?: (id: string) => boolean;
}) {
  return (
    <div className="flex flex-col gap-6 pt-1">
      {groupByDay(events).map((g) => (
        <DateGroup key={g.key} label={g.label} weekday={g.weekday}>
          {g.events.map((e) => (
            <EventRow key={e.id} event={e} going={isGoing?.(e.id)} />
          ))}
        </DateGroup>
      ))}
    </div>
  );
}
