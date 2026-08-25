"use client";

// "Hosting" on your profile — the events you organize (Luma-style), with a
// direct path into each one's manage screen.

import Link from "next/link";
import { LuCalendarPlus, LuSettings2 } from "react-icons/lu";

import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { EventRow } from "@/components/event/event-row";
import { useHostedEvents } from "@/hooks/use-hosted-events";

export function HostingList() {
  const { hosted, loading } = useHostedEvents();

  if (loading && hosted.length === 0)
    return <Skeleton className="h-28 rounded-2xl" />;

  if (hosted.length === 0) {
    return (
      <EmptyState
        icon={LuCalendarPlus}
        title="Not hosting yet"
        subtitle="Create an event and it will show up here."
        action={
          <Link
            href="/create"
            className="inline-flex h-10 items-center gap-1.5 rounded-full bg-primary px-4 text-[13px] font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Create an event
          </Link>
        }
      />
    );
  }

  return (
    <div className="flex flex-col gap-2.5">
      {hosted.map((e) => (
        <div key={e.id} className="flex flex-col gap-1">
          <EventRow event={e} />
          <Link
            href={`/manage/${e.id}`}
            className="inline-flex items-center gap-1 self-end text-[12px] font-semibold text-muted-foreground transition-colors hover:text-foreground"
          >
            <LuSettings2 className="size-3.5" aria-hidden />
            Manage
          </Link>
        </div>
      ))}
    </div>
  );
}
