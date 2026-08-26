"use client";

// The host's event dashboard (Luma-style "Manage"): Overview, Guests (the
// decision queue), Settings, and the event's own support Inbox. Ownership is
// enforced server-side — a stranger opening this URL gets the lock screen.

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { LuArrowUpRight, LuLock } from "react-icons/lu";

import { BackButton } from "@/components/ui/back-button";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ManageOverview } from "@/components/manage/manage-overview";
import { ManageGuests } from "@/components/manage/manage-guests";
import { ManageSettings } from "@/components/manage/manage-settings";
import { ManageInbox } from "@/components/manage/manage-inbox";
import { useManageEvent } from "@/hooks/use-manage-event";
import { eventCode } from "@/lib/events-data";

type Tab = "overview" | "guests" | "settings" | "inbox";
const TABS: Tab[] = ["overview", "guests", "settings", "inbox"];

export function ManageScreen({ eventId }: { eventId: string }) {
  const { data, loading, forbidden, refetch } = useManageEvent(eventId);
  // Notifications deep-link straight to a tab (?tab=guests / ?tab=inbox).
  const wanted = useSearchParams().get("tab");
  const [tab, setTab] = useState<Tab>(
    TABS.includes(wanted as Tab) ? (wanted as Tab) : "overview",
  );

  if (forbidden) {
    return (
      <div className="px-4 pt-16 lg:mx-auto lg:w-full lg:max-w-xl lg:py-24">
        <EmptyState
          icon={LuLock}
          title="This isn't your event"
          subtitle="Only the host who created this event can manage it."
        />
      </div>
    );
  }

  if (loading && !data) {
    return (
      <div className="flex flex-col gap-3 px-4 pt-6 lg:mx-auto lg:w-full lg:max-w-4xl lg:pt-8">
        <Skeleton className="h-10 rounded-full" />
        <Skeleton className="h-40 rounded-2xl" />
        <Skeleton className="h-40 rounded-2xl" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="px-4 pt-16 lg:mx-auto lg:w-full lg:max-w-xl lg:py-24">
        <EmptyState
          icon={LuLock}
          title="Event not found"
          subtitle="It may have been removed."
        />
      </div>
    );
  }

  const openFeedback = data.feedback.filter((f) => f.status === "open").length;
  // Catalog (admin-created) events are edited from /admin; a host-created one
  // carries its draft and gets the Settings tab.
  const editable = data.draft !== null;
  const shownTab: Tab = tab === "settings" && !editable ? "overview" : tab;

  return (
    <div className="flex flex-col gap-4 px-4 pb-10 pt-4 lg:mx-auto lg:w-full lg:max-w-4xl lg:pt-8">
      <header className="flex items-center gap-3">
        <BackButton className="shrink-0 ring-1 ring-border" />
        <h1 className="min-w-0 flex-1 truncate text-[16px] font-semibold tracking-tight text-foreground">
          {data.event.title}
        </h1>
        <Link
          href={`/${eventCode(data.event.id)}`}
          className="inline-flex shrink-0 items-center gap-1 rounded-full bg-card px-3.5 py-2 text-[12px] font-semibold text-foreground ring-1 ring-border transition-colors hover:bg-muted"
        >
          Event page
          <LuArrowUpRight className="size-3" aria-hidden />
        </Link>
      </header>

      <Tabs value={shownTab} onValueChange={(v) => setTab(v as Tab)}>
        <TabsList className="w-full">
          <TabsTrigger value="overview" className="flex-1">
            Overview
          </TabsTrigger>
          <TabsTrigger value="guests" className="flex-1 gap-1.5">
            Guests
            {data.requests.length > 0 && (
              <span className="grid size-4 place-items-center rounded-full bg-gold text-[9.5px] font-bold text-navy">
                {data.requests.length > 9 ? "9+" : data.requests.length}
              </span>
            )}
          </TabsTrigger>
          {editable && (
            <TabsTrigger value="settings" className="flex-1">
              Settings
            </TabsTrigger>
          )}
          <TabsTrigger value="inbox" className="flex-1 gap-1.5">
            Inbox
            {openFeedback > 0 && (
              <span className="grid size-4 place-items-center rounded-full bg-gold text-[9.5px] font-bold text-navy">
                {openFeedback > 9 ? "9+" : openFeedback}
              </span>
            )}
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {shownTab === "overview" && (
        <ManageOverview data={data} onOpenGuests={() => setTab("guests")} />
      )}
      {shownTab === "guests" && <ManageGuests data={data} onChanged={refetch} />}
      {shownTab === "settings" && data.draft && (
        <ManageSettings draft={data.draft} onSaved={refetch} />
      )}
      {shownTab === "inbox" && <ManageInbox data={data} onChanged={refetch} />}
    </div>
  );
}
