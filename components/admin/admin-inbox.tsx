"use client";

// The inbox: every question and report users sent from event pages. Open items
// lead; resolving keeps the history (reopen anytime). Each row links to the
// live event so the admin can judge with full context.

import { useState } from "react";
import Link from "next/link";
import { LuInbox, LuFlag, LuMail, LuArrowUpRight } from "react-icons/lu";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { eventCode } from "@/lib/events-data";
import { setReportStatus, type EventReport } from "@/lib/api/admin";
import { cn } from "@/lib/utils";

export function AdminInbox({
  reports,
  loading,
  onChanged,
}: {
  reports: EventReport[];
  loading: boolean;
  onChanged: () => void;
}) {
  const [view, setView] = useState<"open" | "all">("open");
  const [busyId, setBusyId] = useState<string | null>(null);
  const shown = view === "open" ? reports.filter((r) => r.status === "open") : reports;

  async function toggle(r: EventReport) {
    setBusyId(r.id);
    try {
      await setReportStatus(r.id, r.status === "open" ? "resolved" : "open");
      onChanged();
    } finally {
      setBusyId(null);
    }
  }

  if (loading && reports.length === 0)
    return <Skeleton className="h-40 rounded-2xl" />;

  return (
    <section className="flex flex-col gap-2.5">
      <Tabs value={view} onValueChange={(v) => setView(v as "open" | "all")}>
        <TabsList className="w-full">
          <TabsTrigger value="open" className="flex-1">
            Open
          </TabsTrigger>
          <TabsTrigger value="all" className="flex-1">
            All ({reports.length})
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {shown.length === 0 ? (
        <EmptyState
          icon={LuInbox}
          title={view === "open" ? "Inbox zero" : "Nothing here yet"}
          subtitle={
            view === "open"
              ? "No open questions or reports — everything's handled."
              : "Questions and reports from event pages will land here."
          }
        />
      ) : (
        <div className="flex flex-col gap-2">
          {shown.map((r) => (
            <article
              key={r.id}
              className={cn(
                "flex flex-col gap-2 rounded-2xl bg-card p-3.5 ring-1 ring-border",
                r.status === "resolved" && "opacity-60",
              )}
            >
              <div className="flex items-center gap-2">
                {r.kind === "report" ? (
                  <Badge className="gap-1 border-transparent bg-destructive/10 text-destructive">
                    <LuFlag className="size-3" aria-hidden /> Report
                  </Badge>
                ) : (
                  <Badge className="gap-1 border-transparent bg-amber-100 text-amber-800">
                    <LuMail className="size-3" aria-hidden /> Question
                  </Badge>
                )}
                <span className="min-w-0 flex-1 truncate text-right text-[11px] text-muted-foreground">
                  {r.from} · {new Date(r.createdAt).toLocaleDateString()}
                </span>
              </div>

              <p className="text-[13px] leading-snug text-foreground">
                {r.message}
              </p>

              <div className="flex items-center justify-between gap-2">
                <Link
                  href={`/${eventCode(r.eventId)}`}
                  className="inline-flex min-w-0 items-center gap-1 text-[12px] font-semibold text-muted-foreground transition-colors hover:text-foreground"
                >
                  <span className="truncate">{r.eventTitle}</span>
                  <LuArrowUpRight className="size-3 shrink-0" aria-hidden />
                </Link>
                <Button
                  size="sm"
                  variant={r.status === "open" ? "default" : "outline"}
                  className="shrink-0 rounded-full text-[12px]"
                  disabled={busyId === r.id}
                  onClick={() => void toggle(r)}
                >
                  {r.status === "open" ? "Resolve" : "Reopen"}
                </Button>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
