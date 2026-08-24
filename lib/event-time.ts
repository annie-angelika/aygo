// Event times are stored as wall-clock "YYYY-MM-DDTHH:mm" strings plus the
// host's timezone label ("GMT-04:00 La Paz"). Nothing here may depend on the
// machine's own zone — the server runs in UTC on Vercel while hosts are in
// Bolivia — so every conversion goes through the event's explicit offset.

/** Bolivia. Catalog events and drafts without a timezone label live here. */
export const DEFAULT_OFFSET_MIN = -4 * 60;

/** "GMT-04:00 La Paz" → -240; anything unparseable → the default offset. */
export function offsetMinutes(timezone?: string | null): number {
  const m = timezone?.match(/GMT([+-])(\d{2}):(\d{2})/);
  if (!m) return DEFAULT_OFFSET_MIN;
  const sign = m[1] === "-" ? -1 : 1;
  return sign * (Number(m[2]) * 60 + Number(m[3]));
}

/** Wall-clock "YYYY-MM-DDTHH:mm" in `timezone` → epoch ms (NaN when malformed). */
export function localToInstant(local: string, timezone?: string | null): number {
  const m = local?.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/);
  if (!m) return NaN;
  const [, y, mo, d, h, mi] = m.map(Number);
  return Date.UTC(y, mo - 1, d, h, mi) - offsetMinutes(timezone) * 60_000;
}

/** The wall-clock date parts of `instant` as seen in `timezone`. */
export function wallClock(instant: number, timezone?: string | null) {
  const shifted = new Date(instant + offsetMinutes(timezone) * 60_000);
  return {
    year: shifted.getUTCFullYear(),
    month: shifted.getUTCMonth(),
    day: shifted.getUTCDate(),
    weekday: shifted.getUTCDay(),
  };
}

/** "YYYY-MM-DD" of `instant` in `timezone`. */
export function dayKeyAt(instant: number, timezone?: string | null): string {
  const { year, month, day } = wallClock(instant, timezone);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${year}-${p(month + 1)}-${p(day)}`;
}
