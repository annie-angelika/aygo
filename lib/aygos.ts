// Presentation helpers for the collection of "aygos" — the collectibles you
// earn by attending events (formerly "stamps"). The earn-date comes from the
// backend (`Stamp.earnedAt`); aygos collected before the backend tracked dates
// fall back to a stable derived date so the wall still groups deterministically.

import type { Stamp } from "@/types";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

// Reference for the legacy fallback date (aygos with no earnedAt). The wall
// only renders client-side (stamps hydrate from localStorage after mount), so
// there's no SSR mismatch risk in the year expansion below.
const REF_MS = Date.UTC(2026, 5, 22);
const DAY = 86_400_000;

const hash = (s: string) => {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
};

const monthLabel = (key: string) => {
  const [year, month] = key.split("-");
  return `${MONTHS[Number(month)]} ${year}`;
};

export type AygoMonth = { key: string; label: string; stamps: Stamp[] };

/**
 * The date an aygo was earned: the backend's `earnedAt` when present, or a
 * stable derived date for aygos collected before the backend tracked it.
 */
function aygoDate(stamp: Stamp): Date {
  if (stamp.earnedAt) {
    const d = new Date(stamp.earnedAt);
    if (!Number.isNaN(d.getTime())) return d;
  }
  const daysAgo = 8 + (hash(stamp.eventId) % 540);
  return new Date(REF_MS - daysAgo * DAY);
}

/** Group collected aygos by the month they were earned, newest first. */
export function groupAygosByMonth(stamps: Stamp[]): AygoMonth[] {
  const map = new Map<string, { s: Stamp; t: number }[]>();
  for (const s of stamps) {
    const d = aygoDate(s);
    const key = `${d.getUTCFullYear()}-${String(d.getUTCMonth()).padStart(2, "0")}`;
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push({ s, t: d.getTime() });
  }
  return [...map.entries()]
    .sort((a, b) => (a[0] < b[0] ? 1 : -1))
    .map(([key, items]) => ({
      key,
      label: monthLabel(key),
      stamps: items.sort((a, b) => b.t - a.t).map((x) => x.s),
    }));
}

/**
 * Expands a year into its full run of months, newest first, so the timeline
 * reads as a complete year: months you collected in carry their aygos, the rest
 * come back empty (rendered as "a quiet month"). The current year stops at the
 * present month (no empty future months); past years run December → January.
 * Months are matched by label, so it works whether the source months were
 * grouped from real aygos or the demo set.
 */
export function monthsForYear(year: string, dataMonths: AygoMonth[]): AygoMonth[] {
  const ref = new Date(); // client-only render; see note on REF_MS above
  const top =
    year === String(ref.getUTCFullYear()) ? ref.getUTCMonth() : MONTHS.length - 1;
  const byLabel = new Map(dataMonths.map((m) => [m.label, m]));

  const out: AygoMonth[] = [];
  for (let m = top; m >= 0; m--) {
    const label = `${MONTHS[m]} ${year}`;
    // Normalize the key per slot — source months carry differing key schemes
    // (real vs demo), which would otherwise collide once mixed into one year.
    const key = `${year}-${String(m).padStart(2, "0")}`;
    const data = byLabel.get(label);
    out.push(data ? { ...data, key } : { key, label, stamps: [] });
  }
  return out;
}

