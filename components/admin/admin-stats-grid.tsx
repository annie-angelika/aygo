"use client";

// The dashboard's headline numbers — everything the store counts, live.

import type { IconType } from "react-icons";
import {
  LuCalendar,
  LuSparkles,
  LuUserCheck,
  LuMailQuestion,
  LuStamp,
  LuUsers,
  LuInbox,
} from "react-icons/lu";

import { Skeleton } from "@/components/ui/skeleton";
import { StatTile } from "@/components/ui/stat-tile";
import type { AdminStats } from "@/lib/api/admin";

const TILES: {
  key: keyof AdminStats["totals"];
  label: string;
  Icon: IconType;
}[] = [
  { key: "events", label: "Events live", Icon: LuCalendar },
  { key: "createdEvents", label: "Created by users", Icon: LuSparkles },
  { key: "going", label: "RSVPs", Icon: LuUserCheck },
  { key: "applications", label: "Join requests", Icon: LuMailQuestion },
  { key: "stamps", label: "Aygos collected", Icon: LuStamp },
  { key: "guests", label: "Active guests", Icon: LuUsers },
  { key: "openReports", label: "Open inbox", Icon: LuInbox },
];

export function AdminStatsGrid({ stats }: { stats?: AdminStats }) {
  if (!stats) {
    return (
      <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
        {TILES.map((t) => (
          <Skeleton key={t.key} className="h-20 rounded-2xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
      {TILES.map(({ key, label, Icon }) => (
        <StatTile key={key} label={label} icon={Icon} value={stats.totals[key]} />
      ))}
    </div>
  );
}
