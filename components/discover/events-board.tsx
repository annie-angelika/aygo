"use client";

import { useState } from "react";
import { LuCalendarX } from "react-icons/lu";

import { useEvents } from "@/hooks/use-events";
import { useRegistrations } from "@/hooks/use-registrations";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { EventTimeline } from "@/components/event/event-timeline";
import { CATEGORIES } from "@/lib/events-data";
import type { Category } from "@/types";

type When = "upcoming" | "past";

/**
 * The "Events" block shared by city, calendar, and category pages: Upcoming/Past
 * tabs, an interest filter, and the date-grouped timeline with its three states.
 * Pass `category` to lock the board to one interest and hide the filter (used by
 * category pages); pass `defaultInterest` to preselect a still-changeable filter.
 *
 * `upcomingOnly` is the agenda variant for category pages: it drops the tabs and
 * the Submit action, shows only what's coming, and groups by month.
 */
export function EventsBoard({
  category,
  defaultInterest,
  upcomingOnly,
}: {
  category?: Category;
  defaultInterest?: Category;
  upcomingOnly?: boolean;
}) {
  const { data, loading } = useEvents();
  const { isGoing } = useRegistrations();
  const [when, setWhen] = useState<When>("upcoming");
  const [interest, setInterest] = useState<Category | "all">(
    category ?? defaultInterest ?? "all",
  );

  const past = !upcomingOnly && when === "past";
  const active = category ?? interest;
  const filtered = data
    .filter((e) => (past ? e.isPast : !e.isPast))
    .filter((e) => active === "all" || e.category === active)
    .sort((a, b) =>
      past
        ? b.startsAt.localeCompare(a.startsAt)
        : a.startsAt.localeCompare(b.startsAt),
    );

  return (
    <div className="flex flex-col gap-4">
      <div className="pt-1">
        <h2 className="text-[17px] font-semibold tracking-tight text-foreground">
          {upcomingOnly ? "Upcoming events" : "Events"}
        </h2>
      </div>

      {!upcomingOnly && (
        <div className="flex items-center justify-between gap-3">
          <Tabs value={when} onValueChange={(v) => setWhen(v as When)}>
            <TabsList>
              <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
              <TabsTrigger value="past">Past</TabsTrigger>
            </TabsList>
          </Tabs>

          {!category && (
            <Select
              value={interest}
              onValueChange={(v) => setInterest(v as Category | "all")}
            >
              <SelectTrigger size="sm" className="w-[140px]">
                <SelectValue>
                  {(val: string) => (val === "all" ? "All interests" : val)}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All interests</SelectItem>
                {CATEGORIES.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      )}

      {loading ? (
        <div className="flex flex-col gap-3 pt-2">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={LuCalendarX}
          title="Nothing here yet"
          subtitle={
            active === "all"
              ? "More events are on the way."
              : `No ${active} events ${past ? "in the past" : "right now"}.`
          }
        />
      ) : (
        <EventTimeline
          events={filtered}
          isGoing={isGoing}
          groupBy={upcomingOnly ? "month" : "day"}
        />
      )}
    </div>
  );
}
