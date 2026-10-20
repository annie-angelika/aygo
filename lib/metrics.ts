// Traction metrics, computed — never typed in — from what the store already
// records: when people finished sign-up, when events were created, when spots
// were taken, requests sent, aygos collected and messages written. Pure
// functions, shared by the server (which builds the report) and the client
// (which exports it as CSV).
//
// Week 1 starts on launch day and each week runs seven days, in La Paz time.
// A week's totals are cumulative AS OF ITS END; `new*` is what that week
// added; `active` is how many distinct people did anything in it. The running
// week shows what there is so far and is flagged `current`.

import type { MetricWeek, MetricsReport, MetricsTotals } from "@/types";
import type { MetricsSource } from "@/lib/server/store/types";

/** Launch day (week 1 of the traction sheet). */
export const LAUNCHED_AT = "2026-08-04";
/** La Paz is UTC-4 all year: local midnight is 04:00 UTC. */
const LA_PAZ_OFFSET_H = 4;
const WEEK_MS = 7 * 86_400_000;

/** Midnight (La Paz) of a YYYY-MM-DD, as an epoch ms. */
function dayStart(date: string): number {
  const [y, m, d] = date.split("-").map(Number);
  return Date.UTC(y, m - 1, d, LA_PAZ_OFFSET_H);
}

/** Epoch ms → YYYY-MM-DD in La Paz time. */
function toLaPazDate(ms: number): string {
  return new Date(ms - LA_PAZ_OFFSET_H * 3_600_000).toISOString().slice(0, 10);
}

type Dated = { at: number; sid: string };
const ms = (iso: string) => new Date(iso).getTime();
const dated = (xs: { at: string; sid: string }[]): Dated[] => xs.map((x) => ({ at: ms(x.at), sid: x.sid }));

/** How many actions happened strictly before `until`. */
const countBefore = (xs: Dated[], until: number) => xs.reduce((n, x) => (x.at < until ? n + 1 : n), 0);
/** How many actions fell inside [from, until). */
const countIn = (xs: Dated[], from: number, until: number) =>
  xs.reduce((n, x) => (x.at >= from && x.at < until ? n + 1 : n), 0);
/** Distinct people with an action inside [from, until). */
function activeIn(all: Dated[][], from: number, until: number): number {
  const sids = new Set<string>();
  for (const xs of all) for (const x of xs) if (x.at >= from && x.at < until) sids.add(x.sid);
  return sids.size;
}

export function buildMetricsReport(
  input: MetricsSource,
  now = Date.now(),
  launchedAt = LAUNCHED_AT,
): MetricsReport {
  const users = dated(input.usernames);
  const events = input.events.map((e) => ({ ...e, at: ms(e.createdAt), startMs: ms(e.startsAt) }));
  const eventActs: Dated[] = events.map((e) => ({ at: e.at, sid: e.sid }));
  // A host is born with their first event.
  const firstEvent = new Map<string, number>();
  for (const e of events) firstEvent.set(e.sid, Math.min(e.at, firstEvent.get(e.sid) ?? Infinity));
  const hosts: Dated[] = [...firstEvent].map(([sid, at]) => ({ at, sid }));
  const going = dated(input.going);
  const applications = dated(input.applications);
  const stamps = dated(input.stamps);
  const reports = dated(input.reports);
  const everything = [users, eventActs, going, applications, stamps, reports];

  const weeks: MetricWeek[] = [];
  const launch = dayStart(launchedAt);
  let prev: MetricWeek | null = null;
  for (let start = launch, i = 1; start <= now; start += WEEK_MS, i++) {
    const end = Math.min(start + WEEK_MS, now + 1);
    const week: MetricWeek = {
      week: i,
      start: toLaPazDate(start),
      current: start + WEEK_MS > now,
      users: countBefore(users, end),
      newUsers: 0,
      hosts: countBefore(hosts, end),
      newHosts: 0,
      events: countBefore(eventActs, end),
      newEvents: 0,
      rsvps: countBefore(going, end),
      newRsvps: 0,
      requests: countBefore(applications, end),
      newRequests: 0,
      checkins: countBefore(stamps, end),
      newCheckins: 0,
      active: activeIn(everything, start, end),
      inbox: countIn(reports, start, end),
      cities: [...new Set(events.filter((e) => e.at < end && e.city).map((e) => e.city as string))].sort(),
    };
    week.newUsers = week.users - (prev?.users ?? 0);
    week.newHosts = week.hosts - (prev?.hosts ?? 0);
    week.newEvents = week.events - (prev?.events ?? 0);
    week.newRsvps = week.rsvps - (prev?.rsvps ?? 0);
    week.newRequests = week.requests - (prev?.requests ?? 0);
    week.newCheckins = week.checkins - (prev?.checkins ?? 0);
    weeks.push(week);
    prev = week;
  }

  const categoryCounts = new Map<string, number>();
  for (const e of events) if (e.category) categoryCounts.set(e.category, (categoryCounts.get(e.category) ?? 0) + 1);
  const totals: MetricsTotals = {
    users: users.length,
    accounts: input.accountsAt.length,
    hosts: hosts.length,
    events: events.length,
    upcomingEvents: events.filter((e) => !Number.isNaN(e.startMs) && e.startMs >= now).length,
    pastEvents: events.filter((e) => !Number.isNaN(e.startMs) && e.startMs < now).length,
    rsvps: going.length,
    requests: applications.length,
    checkins: stamps.length,
    activeWeek: activeIn(everything, now - WEEK_MS, now + 1),
    cities: [...new Set(events.map((e) => e.city).filter((c): c is string => !!c))].sort(),
    categories: [...categoryCounts].map(([category, count]) => ({ category, count })).sort((a, b) => b.count - a.count),
    openReports: input.openReports,
  };

  return { generatedAt: new Date(now).toISOString(), launchedAt, totals, weeks };
}

/** The weekly table as CSV (Sheets/Excel paste-ready), in the traction sheet's spirit. */
export function reportToCsv(report: MetricsReport): string {
  const head = [
    "Semana", "Fecha", "Usuarios", "Nuevos usuarios", "Hosts", "Nuevos hosts", "Eventos", "Nuevos eventos",
    "Reservas", "Solicitudes", "Check-ins", "Activos en la semana", "Preguntas y reportes", "Ciudades con eventos",
  ];
  const cell = (v: unknown) => {
    const s = v == null ? "" : String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const rows = report.weeks.map((w) => [
    w.week, w.start, w.users, w.newUsers, w.hosts, w.newHosts, w.events, w.newEvents,
    w.rsvps, w.requests, w.checkins, w.active, w.inbox, w.cities.join(", "),
  ]);
  return [head, ...rows].map((r) => r.map(cell).join(",")).join("\n");
}
