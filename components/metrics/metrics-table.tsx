// The weekly table: one row per week since launch. Cumulative totals with
// what the week added in brackets, who was active, what reached the inbox,
// and the cities with events — every cell counted from the app's own records.

import type { MetricWeek } from "@/types";

const TH = "px-2 py-2 text-left text-[10.5px] font-semibold uppercase tracking-wider text-muted-foreground";
const TD = "px-2 py-1.5 text-[12.5px] tabular-nums text-foreground";

function Cum({ total, fresh }: { total: number; fresh: number }) {
  return (
    <>
      {total.toLocaleString()}
      {fresh > 0 && <span className="ml-1 text-[11px] text-muted-foreground">+{fresh}</span>}
    </>
  );
}

export function MetricsTable({ weeks }: { weeks: MetricWeek[] }) {
  return (
    <div className="overflow-x-auto rounded-2xl bg-card ring-1 ring-border">
      <table className="w-full min-w-[820px] border-collapse">
        <thead>
          <tr className="border-b border-border">
            <th className={TH}>Week</th>
            <th className={TH}>From</th>
            <th className={TH}>Users</th>
            <th className={TH}>Hosts</th>
            <th className={TH}>Events</th>
            <th className={TH}>Spots</th>
            <th className={TH}>Requests</th>
            <th className={TH}>Check-ins</th>
            <th className={TH} title="Distinct people who did anything that week">Active</th>
            <th className={TH} title="Questions and reports sent that week">Inbox</th>
            <th className={TH}>Cities with events</th>
          </tr>
        </thead>
        <tbody>
          {weeks.map((w, i) => (
            <tr key={w.week} className={i > 0 ? "border-t border-border" : undefined}>
              <td className={`${TD} font-semibold`}>
                {w.week}
                {w.current && <span className="ml-1.5 rounded-full bg-gold-soft px-1.5 py-px text-[10px] font-semibold text-gold-deep">now</span>}
              </td>
              <td className={`${TD} whitespace-nowrap text-muted-foreground`}>{w.start}</td>
              <td className={TD}><Cum total={w.users} fresh={w.newUsers} /></td>
              <td className={TD}><Cum total={w.hosts} fresh={w.newHosts} /></td>
              <td className={TD}><Cum total={w.events} fresh={w.newEvents} /></td>
              <td className={TD}><Cum total={w.rsvps} fresh={w.newRsvps} /></td>
              <td className={TD}><Cum total={w.requests} fresh={w.newRequests} /></td>
              <td className={TD}><Cum total={w.checkins} fresh={w.newCheckins} /></td>
              <td className={TD}>{w.active.toLocaleString()}</td>
              <td className={TD}>{w.inbox.toLocaleString()}</td>
              <td className={`${TD} max-w-[320px] text-muted-foreground`}>
                {w.cities.length > 0 ? w.cities.join(", ") : "—"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
