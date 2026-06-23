// Small date helpers for the create flow. Datetime values are kept as local
// "YYYY-MM-DDTHH:mm" strings (the shape of <input type="datetime-local">), so
// these split/format/recombine them without pulling in a date library.

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
export const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const MONTHS_SHORT = MONTHS.map((m) => m.slice(0, 3));

/** "2026-06-23" → Date (local midnight). */
export function parseDate(date: string): Date {
  const [y, m, d] = date.split("-").map(Number);
  return new Date(y, (m || 1) - 1, d || 1);
}

/** Date → "2026-06-23". */
export function toDateValue(d: Date): string {
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

/** Today as "2026-06-23". */
export function todayValue(): string {
  return toDateValue(new Date());
}

/** "2026-06-23" → "Tue, Jun 23". */
export function formatDayPill(date: string): string {
  if (!date) return "Add date";
  const d = parseDate(date);
  return `${WEEKDAYS[d.getDay()]}, ${MONTHS_SHORT[d.getMonth()]} ${d.getDate()}`;
}

/** "22:30" → "10:30 PM". */
export function formatTimePill(time: string): string {
  if (!time) return "Add time";
  const [h, m] = time.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${hour12}:${String(m).padStart(2, "0")} ${period}`;
}

export function monthLabel(year: number, month: number): string {
  return `${MONTHS[month]} ${year}`;
}

/**
 * The 6×7 grid of dates for a month view, including leading/trailing days from
 * the neighbouring months (Sunday-first), each tagged with whether it's in the
 * shown month.
 */
export function buildMonthGrid(year: number, month: number) {
  const first = new Date(year, month, 1);
  const start = new Date(year, month, 1 - first.getDay()); // back up to Sunday
  return Array.from({ length: 42 }, (_, i) => {
    const d = new Date(start.getFullYear(), start.getMonth(), start.getDate() + i);
    return { date: d, value: toDateValue(d), inMonth: d.getMonth() === month };
  });
}

export const WEEKDAY_INITIALS = ["S", "M", "T", "W", "T", "F", "S"];
