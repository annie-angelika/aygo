"use client";

// The creation feed: the last events users made, newest first, each linking to
// its live share page so the admin can inspect exactly what attendees see.

import { useState } from "react";
import Link from "next/link";
import { LuCalendarPlus, LuChevronRight, LuTrash2 } from "react-icons/lu";

import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { eventCode } from "@/lib/events-data";
import { adminDeleteEvent, type AdminStats } from "@/lib/api/admin";

export function RecentCreated({
  stats,
  onChanged,
}: {
  stats?: AdminStats;
  onChanged: () => void;
}) {
  const [busyId, setBusyId] = useState<string | null>(null);

  if (!stats) return <Skeleton className="h-40 rounded-2xl" />;

  async function remove(id: string, title: string) {
    if (!window.confirm(`Remove "${title}"? This takes it off the app for everyone.`))
      return;
    setBusyId(id);
    try {
      await adminDeleteEvent(id);
      onChanged();
    } finally {
      setBusyId(null);
    }
  }

  if (stats.recentCreated.length === 0) {
    return (
      <EmptyState
        icon={LuCalendarPlus}
        title="No user-created events yet"
        subtitle="When someone creates an event, it lands here the moment it syncs."
      />
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl bg-card ring-1 ring-border">
      {stats.recentCreated.map((e, i) => (
        <div
          key={e.id}
          className={
            "flex items-center gap-1.5 pr-2 " + (i > 0 ? "border-t border-border" : "")
          }
        >
          <Link
            href={`/${eventCode(e.id)}`}
            className="flex min-w-0 flex-1 items-center gap-3 px-3.5 py-3 transition-colors hover:bg-muted"
          >
            <div className="min-w-0 flex-1">
              <p className="truncate text-[13.5px] font-semibold text-foreground">
                {e.title}
              </p>
              <p className="truncate text-[11.5px] text-muted-foreground">
                by {e.creator} · starts {e.startsAt.replace("T", " ")} · created{" "}
                {new Date(e.createdAt).toLocaleDateString()}
              </p>
            </div>
            <LuChevronRight
              className="size-4 shrink-0 text-muted-foreground"
              aria-hidden
            />
          </Link>
          <Button
            variant="ghost"
            size="icon"
            className="size-8 shrink-0 rounded-full text-destructive hover:text-destructive"
            aria-label={`Remove ${e.title}`}
            disabled={busyId === e.id}
            onClick={() => void remove(e.id, e.title)}
          >
            <LuTrash2 className="size-3.5" />
          </Button>
        </div>
      ))}
    </div>
  );
}
