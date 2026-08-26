// Presentation helpers for the collection of "aygos" — the collectibles you
// earn by attending events (formerly "stamps"). The earn-date is real: the
// server stamps it when it grants the aygo, and the client records the moment
// it collected one. An aygo with no usable date is grouped under "Earlier" —
// never given an invented one.

import type { Stamp } from "@/types";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

/** Key + label for aygos whose earn-date is unknown. */
export const UNDATED_KEY = "0000-00";
const UNDATED = { key: UNDATED_KEY, label: "Earlier" } as const;

const monthLabel = (key: string) => {
  if (key === UNDATED.key) return UNDATED.label;
  const [year, month] = key.split("-");
  return `${MONTHS[Number(month)]} ${year}`;
};

export type AygoMonth = { key: string; label: string; stamps: Stamp[] };

/** The date an aygo was earned, or null when it isn't known. */
function aygoDate(stamp: Stamp): Date | null {
  if (!stamp.earnedAt) return null;
  const d = new Date(stamp.earnedAt);
  return Number.isNaN(d.getTime()) ? null : d;
}

/** Group collected aygos by the month they were earned, newest first. */
export function groupAygosByMonth(stamps: Stamp[]): AygoMonth[] {
  const map = new Map<string, { s: Stamp; t: number }[]>();
  for (const s of stamps) {
    const d = aygoDate(s);
    const key = d
      ? `${d.getUTCFullYear()}-${String(d.getUTCMonth()).padStart(2, "0")}`
      : UNDATED.key;
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push({ s, t: d?.getTime() ?? 0 });
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
 * Months are matched by label.
 */
export function monthsForYear(year: string, dataMonths: AygoMonth[]): AygoMonth[] {
  const ref = new Date(); // client-only render (stamps hydrate after mount)
  const top =
    year === String(ref.getUTCFullYear()) ? ref.getUTCMonth() : MONTHS.length - 1;
  const byLabel = new Map(dataMonths.map((m) => [m.label, m]));

  const out: AygoMonth[] = [];
  for (let m = top; m >= 0; m--) {
    const label = `${MONTHS[m]} ${year}`;
    const key = `${year}-${String(m).padStart(2, "0")}`;
    const data = byLabel.get(label);
    out.push(data ? { ...data, key } : { key, label, stamps: [] });
  }
  return out;
}

