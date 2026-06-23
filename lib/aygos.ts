// Presentation helpers for the collection of "aygos" — the collectibles you
// earn by attending events (formerly "stamps"). The Stamp model carries no
// earn-date, so dates live here (visual layer only) to group the wall by month,
// the way a POAP collection reads. Swap for real earned-at timestamps when the
// backend tracks them; the components won't change.

import type { Stamp, Category } from "@/types";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

// Demo reference "today" (matches the events mock) so SSR and client agree —
// no Date.now(), which would cause a hydration mismatch.
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

// A spread of vibrant disc treatments so the wall reads as a varied collection
// of unique collectibles, not a row of identical category icons.
const GRADIENTS = [
  "bg-gradient-to-br from-violet-500 to-fuchsia-500",
  "bg-gradient-to-br from-amber-400 to-orange-500",
  "bg-gradient-to-br from-emerald-400 to-teal-500",
  "bg-gradient-to-br from-rose-400 to-pink-500",
  "bg-gradient-to-br from-sky-400 to-indigo-500",
  "bg-gradient-to-br from-fuchsia-500 to-purple-600",
  "bg-gradient-to-br from-lime-400 to-emerald-500",
  "bg-gradient-to-br from-orange-400 to-rose-500",
  "bg-gradient-to-br from-cyan-400 to-blue-500",
  "bg-gradient-to-br from-indigo-500 to-violet-600",
];

/** Stable, colorful disc treatment for an aygo. */
export const aygoGradient = (eventId: string) =>
  GRADIENTS[hash(eventId) % GRADIENTS.length];

/** Stable demo artwork for an aygo (stands in for the backend image). */
export const aygoImage = (eventId: string) =>
  `https://picsum.photos/seed/${eventId}/200/200`;

/** Stable earn-date for a real aygo, spread across the past ~18 months. */
function aygoDate(eventId: string): Date {
  const daysAgo = 8 + (hash(eventId) % 540);
  return new Date(REF_MS - daysAgo * DAY);
}

/** Group real collected aygos by the month they were earned, newest first. */
export function groupAygosByMonth(stamps: Stamp[]): AygoMonth[] {
  const map = new Map<string, { s: Stamp; t: number }[]>();
  for (const s of stamps) {
    const d = aygoDate(s.eventId);
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
  const ref = new Date(REF_MS);
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

// ---- Demo collection ------------------------------------------------------
// A fuller, believable collection used when you haven't earned real aygos yet,
// so the wall looks alive. Clustered into a few months for a dense top wall.

type DemoAygo = Stamp & { month: string };
const A = (
  eventId: string,
  title: string,
  category: Category,
  month: string,
): DemoAygo => ({ eventId, title, category, month });

const DEMO_AYGOS: DemoAygo[] = [
  // June 2026 — the dense, current wall
  A("a-marka", "Peña La Marka", "Music", "2026-06"),
  A("a-saltena", "Salteña Crawl", "Food", "2026-06"),
  A("a-killi", "Killi Killi Sunset", "Outdoors", "2026-06"),
  A("a-prado", "After del Prado", "Party", "2026-06"),
  A("a-feria", "Miraflores Fair", "Culture", "2026-06"),
  A("a-jazz", "Jazz en Sopocachi", "Music", "2026-06"),
  A("a-downhill", "Downhill La Cumbre", "Sports", "2026-06"),
  A("a-anticucho", "Anticucho Night", "Food", "2026-06"),
  A("a-muela", "Muela del Diablo", "Outdoors", "2026-06"),
  A("a-rooftop", "Rooftop Sopocachi", "Party", "2026-06"),
  A("a-mural", "Mural Tour", "Culture", "2026-06"),
  A("a-charango", "Charango Night", "Music", "2026-06"),
  A("a-bici", "Bike Pampalarama", "Sports", "2026-06"),
  A("a-api", "Api & Pastel", "Food", "2026-06"),
  A("a-luna", "Valle de la Luna", "Outdoors", "2026-06"),
  // April 2026
  A("a-cumbia", "Cumbia del Prado", "Music", "2026-04"),
  A("a-mercado", "Mercado Lanza", "Food", "2026-04"),
  A("a-chacaltaya", "Chacaltaya Summit", "Outdoors", "2026-04"),
  A("a-ceramica", "Cerámica Workshop", "Culture", "2026-04"),
  A("a-carnaval", "Carnaval Paceño", "Party", "2026-04"),
  A("a-futbol", "Fútbol Miraflores", "Sports", "2026-04"),
  A("a-teatro", "Teatro Municipal", "Culture", "2026-04"),
  A("a-streetfood", "Street Food Prado", "Food", "2026-04"),
  A("a-folklore", "Folklore Festival", "Music", "2026-04"),
  // January 2026
  A("a-cumbre", "Cumbre Trail", "Outdoors", "2026-01"),
  A("a-nye", "NYE La Paz", "Party", "2026-01"),
  A("a-book", "Book Fair La Paz", "Culture", "2026-01"),
  A("a-djset", "DJ Set Sopocachi", "Music", "2026-01"),
  A("a-cocha", "Cochabamba Tour", "Food", "2026-01"),
  A("a-climb", "Climb Aranjuez", "Sports", "2026-01"),
  A("a-pampa", "Pampalarama", "Outdoors", "2026-01"),
  // October 2025
  A("a-halloween", "Halloween Prado", "Party", "2025-10"),
  A("a-gallery", "Gallery Opening", "Culture", "2025-10"),
  A("a-wadi", "Wadi Run", "Sports", "2025-10"),
  A("a-tasting", "Market Tasting", "Food", "2025-10"),
  // July 2025
  A("a-folk2", "Sunset Beats", "Music", "2025-07"),
  A("a-valle", "Valle de las Ánimas", "Outdoors", "2025-07"),
  A("a-after2", "Cumbre After", "Party", "2025-07"),
];

export const DEMO_AYGO_COUNT = DEMO_AYGOS.length;

// Ordered months to show on the demo wall. "2026-05" (May) carries no aygos on
// purpose — it demonstrates how a quiet month renders. Months are 1-based here
// ("2026-06" = June) for readability.
const DEMO_MONTHS = ["2026-06", "2026-05", "2026-04", "2026-01", "2025-10", "2025-07"];

/** The demo collection, grouped by month (newest first), gaps included. */
export function demoCollectionByMonth(): AygoMonth[] {
  return DEMO_MONTHS.map((key) => {
    const [year, month] = key.split("-");
    return {
      key,
      label: `${MONTHS[Number(month) - 1]} ${year}`,
      stamps: DEMO_AYGOS.filter((a) => a.month === key).map((a) => ({
        eventId: a.eventId,
        title: a.title,
        category: a.category,
        image: aygoImage(a.eventId),
      })),
    };
  });
}
