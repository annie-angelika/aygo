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
  LuGlobe,
  LuInbox,
} from "react-icons/lu";

import { Skeleton } from "@/components/ui/skeleton";
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
  { key: "travelers", label: "Travelers", Icon: LuGlobe },
  { key: "openReports", label: "Open inbox", Icon: LuInbox },
];

export function AdminStatsGrid({ stats }: { stats?: AdminStats }) {
  if (!stats) {
    return (
      <div className="grid grid-cols-2 gap-2">
        {TILES.map((t) => (
          <Skeleton key={t.key} className="h-20 rounded-2xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-2">
      {TILES.map(({ key, label, Icon }) => (
        <div
          key={key}
          className="flex flex-col gap-1 rounded-2xl bg-card px-3.5 py-3 ring-1 ring-border"
        >
          <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            <Icon className="size-3.5 text-gold-deep" aria-hidden />
            {label}
          </span>
          <span className="text-[20px] font-semibold leading-none tracking-tight tabular-nums text-foreground">
            {stats.totals[key].toLocaleString()}
          </span>
        </div>
      ))}
    </div>
  );
}
