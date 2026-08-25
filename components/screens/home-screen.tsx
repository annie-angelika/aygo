"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { LuTicket, LuMountain } from "react-icons/lu";

import { useEvents } from "@/hooks/use-events";
import { useRegistrations } from "@/hooks/use-registrations";
import { ScreenHeader } from "@/components/ui/screen-header";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { EventTimeline } from "@/components/event/event-timeline";
import { SiteFooter } from "@/components/layout/site-footer";
import type { AygoEvent } from "@/types";

export type Period = "upcoming" | "past";

/** Your tickets — events you're going to (Upcoming) and attended (Past). */
export function HomeScreen({ period }: { period: Period }) {
  const router = useRouter();
  const { data, loading } = useEvents();
  const { going, stamps, isGoing } = useRegistrations();

  const upcoming = data
    .filter((e) => going.includes(e.id))
    .sort((a, b) => a.startsAt.localeCompare(b.startsAt));
  const past = stamps
    .map((s) => data.find((e) => e.id === s.eventId))
    .filter((e): e is AygoEvent => Boolean(e))
    .sort((a, b) => b.startsAt.localeCompare(a.startsAt));

  const list = period === "past" ? past : upcoming;

  return (
    <div className="flex min-h-[calc(100dvh-3.5rem)] -mb-16 flex-col gap-4 px-4 pt-4 lg:-mb-24 lg:min-h-[calc(100dvh-4rem)] lg:pt-8">
      <ScreenHeader
        eyebrow="Going & attended"
        title="Tickets"
        className="lg:[&_h1]:text-[36px]"
        trailing={
          <Tabs
            value={period}
            onValueChange={(v) =>
              router.replace(`/home?period=${v}`, { scroll: false })
            }
          >
            <TabsList>
              <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
              <TabsTrigger value="past">Past</TabsTrigger>
            </TabsList>
          </Tabs>
        }
      />

      {loading ? (
        <div className="flex flex-col gap-3 pt-2 md:grid md:grid-cols-2">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-28 rounded-[18px]" />
          ))}
        </div>
      ) : list.length === 0 ? (
        period === "past" ? (
          <EmptyState
            icon={LuMountain}
            title="No past events yet"
            subtitle="Events you check in to show up here and earn a passport stamp."
            className="lg:mx-auto lg:w-full lg:max-w-xl"
          />
        ) : (
          <EmptyState
            icon={LuTicket}
            title="You're not going to anything yet"
            subtitle="Find something you like and tap “I'm going”."
            className="lg:mx-auto lg:w-full lg:max-w-xl"
            action={<Button nativeButton={false} render={<Link href="/discover" />} className="h-10 rounded-full px-5 font-semibold">Discover events</Button>}
          />
        )
      ) : (
        <EventTimeline events={list} isGoing={isGoing} />
      )}

      <div className="-mx-4 mt-auto">
        <SiteFooter />
      </div>
    </div>
  );
}
