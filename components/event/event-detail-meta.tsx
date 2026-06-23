import { LuMapPin, LuArrowUpRight } from "react-icons/lu";

import type { AygoEvent } from "@/types";

const MONTHS = [
  "JAN", "FEB", "MAR", "APR", "MAY", "JUN",
  "JUL", "AUG", "SEP", "OCT", "NOV", "DEC",
];

/** "2026-06-21" → { month: "JUN", day: "21" } for the calendar tile. */
function calendarParts(dayKey: string) {
  const [, m, d] = dayKey.split("-");
  return { month: MONTHS[Number(m) - 1] ?? "", day: String(Number(d)) };
}

/**
 * The when + where header, Luma-style: two rows, each led by a square icon tile
 * (a calendar block for the date, a pin for the place) so each fact reads on its
 * own line instead of crammed together.
 */
export function EventDetailMeta({ event }: { event: AygoEvent }) {
  const { month, day } = calendarParts(event.dayKey);
  const dateText = event.dayLabel.replace(/^\w+,\s*/, "");
  const mapQuery = encodeURIComponent(`${event.place}, ${event.city}, Bolivia`);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <div className="flex size-11 shrink-0 flex-col items-center justify-center rounded-xl bg-muted ring-1 ring-border">
          <span className="text-[8.5px] font-semibold uppercase leading-none tracking-wider text-amber-600">
            {month}
          </span>
          <span className="mt-0.5 text-[16px] font-semibold leading-none text-foreground">
            {day}
          </span>
        </div>
        <div className="min-w-0">
          <p className="text-[14px] font-semibold text-foreground">
            {event.weekday}, {dateText}
          </p>
          <p className="text-[12.5px] text-muted-foreground">
            {event.timeLabel}
          </p>
        </div>
      </div>

      <a
        href={`https://maps.google.com/?q=${mapQuery}`}
        target="_blank"
        rel="noreferrer"
        className="group flex items-center gap-3"
      >
        <div className="grid size-11 shrink-0 place-items-center rounded-xl bg-muted text-muted-foreground ring-1 ring-border">
          <LuMapPin className="size-5" aria-hidden />
        </div>
        <div className="min-w-0 flex-1">
          <p className="flex items-center gap-1 text-[14px] font-semibold text-foreground">
            <span className="truncate">{event.place}</span>
            <LuArrowUpRight
              className="size-3.5 shrink-0 text-muted-foreground transition-colors group-hover:text-foreground"
              aria-hidden
            />
          </p>
          <p className="truncate text-[12.5px] text-muted-foreground">
            {event.city}, Bolivia
          </p>
        </div>
      </a>
    </div>
  );
}
