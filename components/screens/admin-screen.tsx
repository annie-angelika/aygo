"use client";

// The admin dashboard, split into four tabs so it stays usable at scale:
// Overview (pulse + latest creations + maintenance), Events (search/manage),
// Calendars, and Inbox (questions + reports, with an open-count badge).

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LuRefreshCw, LuDatabase, LuLogOut, LuTriangleAlert } from "react-icons/lu";

import { BackButton } from "@/components/ui/back-button";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AdminGate } from "@/components/admin/admin-gate";
import { AdminStatsGrid } from "@/components/admin/admin-stats-grid";
import { AdminInbox } from "@/components/admin/admin-inbox";
import { RecentCreated } from "@/components/admin/recent-created";
import { ManageEvents } from "@/components/admin/manage-events";
import { ManageCalendars } from "@/components/admin/manage-calendars";
import { useAdminStats, useAdminReports, reseed } from "@/hooks/use-admin";
import { useAuth } from "@/hooks/use-auth";

type Tab = "overview" | "events" | "calendars" | "inbox";

export function AdminScreen() {
  return (
    <AdminGate>{({ logout }) => <Dashboard onExit={logout} />}</AdminGate>
  );
}

function Dashboard({ onExit }: { onExit: () => Promise<void> }) {
  const { stats, error, refetch } = useAdminStats(true);
  const inbox = useAdminReports(true);
  const { name, email } = useAuth();
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("overview");

  const openCount =
    stats?.totals.openReports ??
    inbox.reports.filter((r) => r.status === "open").length;

  const refreshAll = () => {
    refetch();
    inbox.refetch();
  };

  return (
    <div className="flex flex-col gap-4 px-4 pb-10 pt-4">
      <header className="flex items-center gap-3">
        <BackButton className="shrink-0 ring-1 ring-border" />
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-[16px] font-semibold tracking-tight text-foreground">
            Admin
          </h1>
          <p className="truncate text-[11.5px] text-muted-foreground">
            {name ?? "Signed in"}
            {email ? ` · ${email}` : ""}
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="shrink-0 rounded-full"
          onClick={() => void onExit().then(() => router.push("/discover"))}
        >
          <LuLogOut className="size-3.5" aria-hidden /> Exit
        </Button>
      </header>

      <Tabs value={tab} onValueChange={(v) => setTab(v as Tab)}>
        <TabsList className="w-full">
          <TabsTrigger value="overview" className="flex-1">
            Overview
          </TabsTrigger>
          <TabsTrigger value="events" className="flex-1">
            Events
          </TabsTrigger>
          <TabsTrigger value="calendars" className="flex-1">
            Calendars
          </TabsTrigger>
          <TabsTrigger value="inbox" className="flex-1 gap-1.5">
            Inbox
            {openCount > 0 && (
              <span className="grid size-4 place-items-center rounded-full bg-amber-500 text-[9.5px] font-bold text-white">
                {openCount > 9 ? "9+" : openCount}
              </span>
            )}
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {error && (
        <p className="inline-flex items-center gap-1.5 rounded-xl bg-destructive/10 px-3 py-2 text-[12px] font-medium text-destructive">
          <LuTriangleAlert className="size-4 shrink-0" aria-hidden />
          Couldn&apos;t load the dashboard — refresh to try again.
        </p>
      )}

      {tab === "overview" && <Overview stats={stats} onRefresh={refreshAll} />}
      {tab === "events" && <ManageEvents onChanged={refreshAll} />}
      {tab === "calendars" && <ManageCalendars />}
      {tab === "inbox" && (
        <AdminInbox
          reports={inbox.reports}
          loading={inbox.loading}
          onChanged={refreshAll}
        />
      )}
    </div>
  );
}

function Overview({
  stats,
  onRefresh,
}: {
  stats: ReturnType<typeof useAdminStats>["stats"];
  onRefresh: () => void;
}) {
  const [note, setNote] = useState<string | null>(null);
  const [seeding, setSeeding] = useState(false);

  async function handleReseed() {
    setSeeding(true);
    setNote(null);
    try {
      const { seeded } = await reseed();
      setNote(`Catalog re-seeded: ${seeded.events} events.`);
      onRefresh();
    } catch {
      setNote("Re-seed failed — check the server logs.");
    } finally {
      setSeeding(false);
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <section className="flex flex-col gap-2.5">
        <div className="flex items-center justify-between">
          <h2 className="text-[15px] font-semibold tracking-tight text-foreground">
            Right now
          </h2>
          <Button
            variant="ghost"
            size="sm"
            className="rounded-full text-[12px]"
            onClick={onRefresh}
            aria-label="Refresh stats"
          >
            <LuRefreshCw className="size-3.5" aria-hidden /> Refresh
          </Button>
        </div>
        <AdminStatsGrid stats={stats} />
      </section>

      <section className="flex flex-col gap-2.5">
        <h2 className="text-[15px] font-semibold tracking-tight text-foreground">
          Latest creations
        </h2>
        <RecentCreated stats={stats} onChanged={onRefresh} />
      </section>

      <section className="flex flex-col gap-2.5">
        <h2 className="text-[15px] font-semibold tracking-tight text-foreground">
          Maintenance
        </h2>
        <div className="flex flex-col gap-2 rounded-2xl bg-card p-3.5 ring-1 ring-border">
          <p className="text-[12px] leading-snug text-muted-foreground">
            Re-seed refreshes the catalog (events, cities, calendars) from the
            bundled data. User data is never touched.
          </p>
          <Button
            variant="outline"
            disabled={seeding}
            onClick={handleReseed}
            className="h-10 rounded-full text-[13px]"
          >
            <LuDatabase className="size-4" aria-hidden />
            {seeding ? "Seeding…" : "Re-seed catalog"}
          </Button>
          {note && (
            <p className="text-[12px] font-medium text-foreground/80">{note}</p>
          )}
        </div>
      </section>
    </div>
  );
}
