// The report's headline numbers, each with what moved this week.

import { LuUsers, LuCalendar, LuUserCheck, LuStamp, LuMapPin, LuSparkles, LuActivity, LuInbox } from "react-icons/lu";

import { StatTile } from "@/components/ui/stat-tile";
import type { MetricsReport } from "@/types";

const plus = (n: number) => `${n >= 0 ? "+" : ""}${n.toLocaleString()} this week`;

export function MetricsKpis({ report }: { report: MetricsReport }) {
  const { totals } = report;
  const week = report.weeks[report.weeks.length - 1];
  const cities = totals.cities;
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-8">
      <StatTile icon={LuUsers} label="Users" value={totals.users} hint={week ? plus(week.newUsers) : undefined} />
      <StatTile icon={LuActivity} label="Active · 7 days" value={totals.activeWeek} hint="did something this week" />
      <StatTile
        icon={LuCalendar}
        label="Events"
        value={totals.events}
        hint={`${totals.upcomingEvents} upcoming · ${totals.pastEvents} past`}
      />
      <StatTile icon={LuUserCheck} label="Spots taken" value={totals.rsvps} hint={week ? plus(week.newRsvps) : undefined} />
      <StatTile icon={LuStamp} label="Check-ins" value={totals.checkins} hint={week ? plus(week.newCheckins) : undefined} />
      <StatTile icon={LuSparkles} label="Hosts" value={totals.hosts} hint={week ? plus(week.newHosts) : undefined} />
      <StatTile icon={LuInbox} label="Requests" value={totals.requests} hint={`${totals.openReports} open in inbox`} />
      <StatTile
        icon={LuMapPin}
        label="Cities"
        value={cities.length}
        hint={cities.length ? cities.join(", ") : "No events yet"}
      />
    </div>
  );
}
