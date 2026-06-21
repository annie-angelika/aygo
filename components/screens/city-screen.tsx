"use client";

import { useState } from "react";
import { LuCalendarX } from "react-icons/lu";

import { useEvents } from "@/hooks/use-events";
import { useRegistrations } from "@/hooks/use-registrations";
import { BackButton } from "@/components/ui/back-button";
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
import { CityHero } from "@/components/city/city-hero";
import { CATEGORIES } from "@/lib/events-data";
import { findCity } from "@/lib/cities-data";
import type { Category } from "@/types";

type When = "upcoming" | "past";

export function CityScreen({
  slug,
  initialInterest,
}: {
  slug: string;
  initialInterest?: string;
}) {
  const city = findCity(slug);
  const { data, loading } = useEvents();
  const { isGoing } = useRegistrations();
  const validInterest = (CATEGORIES as string[]).includes(initialInterest ?? "")
    ? (initialInterest as Category)
    : "all";
  const [subscribed, setSubscribed] = useState(Boolean(city?.subscribed));
  const [when, setWhen] = useState<When>("upcoming");
  const [interest, setInterest] = useState<Category | "all">(validInterest);

  const filtered = data
    .filter((e) => (when === "past" ? e.isPast : !e.isPast))
    .filter((e) => interest === "all" || e.category === interest)
    .sort((a, b) =>
      when === "past"
        ? b.startsAt.localeCompare(a.startsAt)
        : a.startsAt.localeCompare(b.startsAt),
    );

  if (!city) return null;

  return (
    <div className="flex flex-col gap-4 px-4 pt-3">
      <BackButton className="self-start" />
      <CityHero
        city={city}
        subscribed={subscribed}
        onToggleSubscribe={() => setSubscribed((s) => !s)}
      />

      <div className="flex items-center justify-between gap-3">
        <Tabs value={when} onValueChange={(v) => setWhen(v as When)}>
          <TabsList>
            <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
            <TabsTrigger value="past">Past</TabsTrigger>
          </TabsList>
        </Tabs>

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
      </div>

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
            interest === "all"
              ? "More events are on the way."
              : `No ${interest} events right now.`
          }
        />
      ) : (
        <EventTimeline events={filtered} isGoing={isGoing} />
      )}
    </div>
  );
}
