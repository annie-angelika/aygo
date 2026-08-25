import { LuMapPin, LuArrowUpRight } from "react-icons/lu";

import type { AygoEvent } from "@/types";

const MONTHS = [
  "JAN", "FEB", "MAR", "APR", "MAY", "JUN",
  "JUL", "AUG", "SEP", "OCT", "NOV", "DEC",
];
const WEEKDAYS_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS_SHORT = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

/** "2026-06-21" → { month: "JUN", day: "21" } for the calendar tile. */
function calendarParts(dayKey: string) {
  const [, m, d] = dayKey.split("-");
  return { month: MONTHS[Number(m) - 1] ?? "", day: String(Number(d)) };
}

/** "2026-08-10T…" → "Mon, Aug 10" for a range's end. */
function shortDay(iso: string): string {
  const d = new Date(iso);
  return `${WEEKDAYS_SHORT[d.getDay()]}, ${MONTHS_SHORT[d.getMonth()]} ${d.getDate()}`;
}

const TILE =
  "flex size-11 shrink-0 flex-col items-center justify-center rounded-[14px] bg-card ring-1 ring-border";

/**
 * The when + where header, Luma-style: two rows, each led by a white square
 * tile (a calendar block for the date, a pin for the place) so each fact reads
 * on its own line instead of crammed together.
 */
export function EventDetailMeta({ event }: { event: AygoEvent }) {
  const { month, day } = calendarParts(event.dayKey);
  const dateText = event.dayLabel.replace(/^\w+,\s*/, "");
  const mapQuery = encodeURIComponent(`${event.place}, ${event.city}, Bolivia`);

  // When an end is set, show it: a same-day end adds a time range, a later day
  // shows the full date span so a multi-day event never looks like one day.
  const endTime = event.endsAt?.slice(11, 16);
  const multiDay = !!event.endsAt && event.endsAt.slice(0, 10) !== event.dayKey;
  const dateLine = multiDay
    ? `${event.weekday}, ${dateText} → ${shortDay(event.endsAt!)}`
    : `${event.weekday}, ${dateText}`;
  const timeLine =
    !multiDay && endTime ? `${event.timeLabel} – ${endTime}` : event.timeLabel;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <div className={TILE}>
          <span className="text-[8.5px] font-semibold uppercase leading-none tracking-[0.08em] text-gold-deep">
            {month}
          </span>
          <span className="mt-[3px] text-[16px] font-semibold leading-none text-foreground">
            {day}
          </span>
        </div>
        <div className="min-w-0">
          <p className="text-[14px] font-semibold text-foreground">
            {dateLine}
          </p>
          <p className="text-[12.5px] text-muted-foreground">
            {timeLine}
          </p>
        </div>
      </div>

      <a
        href={`https://maps.google.com/?q=${mapQuery}`}
        target="_blank"
        rel="noreferrer"
        className="group flex items-center gap-3"
      >
        <div className={`${TILE} text-muted-foreground`}>
          <LuMapPin className="size-5" aria-hidden />
        </div>
        <div className="min-w-0 flex-1">
          <p className="flex items-center gap-1 text-[14px] font-semibold text-foreground">
            <span className="truncate">{event.place}</span>
            <LuArrowUpRight
              className="size-3.5 shrink-0 text-muted-foreground transition-colors group-hover:text-gold-deep"
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
