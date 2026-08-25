"use client";

// The whole Discover page below the top bar: the navy hero (date, title, city,
// search), then either the browse sections or — the moment you type or tap
// "See all" — the matching events. One client island so the search box can
// swap what's underneath without a round trip.

import { useState } from "react";
import Link from "next/link";
import { LuArrowRight, LuCalendarX, LuSearch, LuX } from "react-icons/lu";

import { useEventFilter } from "@/hooks/use-event-filter";
import { useRegistrations } from "@/hooks/use-registrations";
import { EventRow } from "@/components/event/event-row";
import { EventTimeline } from "@/components/event/event-timeline";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { SectionTitle } from "@/components/ui/section-title";
import { IllimaniRidge, MarkLaPaz } from "@/components/ui/brand-icons";
import { InterestRow } from "@/components/discover/interest-row";
import { CalendarRow } from "@/components/discover/calendar-row";
import { CityExplorer } from "@/components/city/city-explorer";
import { cn } from "@/lib/utils";

const TODAY_LABEL = new Intl.DateTimeFormat("en-US", {
  weekday: "long",
  month: "long",
  day: "numeric",
});

export function DiscoverBoard() {
  const [query, setQuery] = useState("");
  const [listAll, setListAll] = useState(false);
  const { isGoing } = useRegistrations();
  const { loading, filtered, extra, setExtra } = useEventFilter({ upcomingOnly: true });

  // The search box drives the shared filter's query so matching (title, place,
  // host, interest, blurb) lives in one place.
  function search(next: string) {
    setQuery(next);
    setExtra({ ...extra, query: next });
  }
  function clear() {
    setListAll(false);
    search("");
  }

  const searching = query.trim().length > 0 || listAll;
  const today = filtered.filter((e) => e.dayLabel === "Today").slice(0, 3);
  const soon = today.length > 0 ? today : filtered.slice(0, 3);

  return (
    <>
      <section className="relative -mt-0 flex flex-col gap-3.5 overflow-hidden rounded-b-3xl bg-navy px-4 pb-16 pt-3 text-cream lg:mt-4 lg:rounded-3xl lg:px-8 lg:pb-24 lg:pt-6">
        <IllimaniRidge />
        <div className="relative flex items-end justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[10.5px] font-semibold uppercase tracking-[0.08em] text-gold">
              {TODAY_LABEL.format(new Date())}
            </p>
            <h1 className="mt-1 text-[30px] font-bold leading-[1.1] tracking-[-0.03em] lg:text-[44px]">
              Discover
            </h1>
          </div>
          <Link
            href="/la-paz"
            className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full bg-white/10 pl-2 pr-2.5 text-[13px] font-semibold ring-1 ring-white/15 transition-colors hover:bg-white/15"
          >
            <MarkLaPaz className="size-5 text-gold" aria-hidden />
            Explore La Paz
            <LuArrowRight className="size-3.5 text-cream/60" aria-hidden />
          </Link>
        </div>

        <label className="relative flex h-11 items-center gap-2.5 rounded-full bg-card px-3.5 text-foreground ring-2 ring-transparent transition-shadow focus-within:ring-gold lg:h-12 lg:max-w-2xl">
          <LuSearch className="size-[18px] shrink-0 text-muted-foreground" aria-hidden />
          <input
            value={query}
            onChange={(e) => search(e.target.value)}
            placeholder="Search events, places or hosts"
            aria-label="Search events"
            className="h-full w-full min-w-0 bg-transparent text-[13.5px] outline-none placeholder:text-muted-foreground"
          />
          {searching && (
            <button
              type="button"
              onClick={clear}
              aria-label="Clear search"
              className="grid size-6 shrink-0 place-items-center rounded-full bg-secondary text-muted-foreground transition-colors hover:text-foreground"
            >
              <LuX className="size-3.5" aria-hidden />
            </button>
          )}
        </label>
      </section>

      {searching ? (
        <section className="flex flex-col gap-3 px-4 pt-5 lg:pt-8">
          <div className="flex items-baseline justify-between px-0.5">
            <h2 className="text-[16px] font-semibold tracking-tight text-foreground">
              {query.trim() ? (
                <>
                  Results{" "}
                  <span className="text-[13px] font-medium text-muted-foreground">
                    for “{query.trim()}”
                  </span>
                </>
              ) : (
                "All upcoming"
              )}
            </h2>
            <span className="text-[12.5px] font-semibold text-muted-foreground">
              {filtered.length} {filtered.length === 1 ? "event" : "events"}
            </span>
          </div>
          {loading ? (
            <RowSkeletons />
          ) : filtered.length === 0 ? (
            <EmptyState
              icon={LuCalendarX}
              title={`Nothing for “${query.trim()}”`}
              subtitle="Try “peña”, “hike” or a neighbourhood — or browse by interest."
            />
          ) : (
            <EventTimeline events={filtered} isGoing={isGoing} stickyOffset="top-14" />
          )}
        </section>
      ) : (
        <div className="flex flex-col gap-7 px-4 pt-5 lg:gap-10 lg:pt-8">
          <section>
            <SectionTitle>Browse by interest</SectionTitle>
            <InterestRow />
          </section>

          <section>
            <SectionTitle
              action={
                <button
                  type="button"
                  onClick={() => setListAll(true)}
                  className="inline-flex items-center gap-1 text-[12.5px] font-semibold text-muted-foreground transition-colors hover:text-foreground"
                >
                  See all
                  <LuArrowRight className="size-3.5" aria-hidden />
                </button>
              }
            >
              {today.length > 0 ? "Today" : "Coming up"}
            </SectionTitle>
            {loading ? (
              <RowSkeletons />
            ) : soon.length === 0 ? (
              <EmptyState
                icon={LuCalendarX}
                title="Nothing on yet"
                subtitle="More events are on the way."
              />
            ) : (
              <div className="relative flex flex-col gap-2.5 pl-5 md:grid md:grid-cols-2 md:pl-0 lg:grid-cols-3">
                <span
                  aria-hidden
                  className="absolute bottom-3.5 left-[4.5px] top-3.5 w-px bg-border md:hidden"
                />
                {soon.map((e) => (
                  <div key={e.id} className="relative">
                    <span
                      aria-hidden
                      className="absolute -left-5 top-1/2 size-2.5 -translate-y-1/2 rounded-full bg-gold ring-4 ring-background md:hidden"
                    />
                    <EventRow event={e} going={isGoing(e.id)} />
                  </div>
                ))}
              </div>
            )}
          </section>

          <section>
            <SectionTitle
              action={
                <Link
                  href="/la-paz/map"
                  className="inline-flex items-center gap-1 text-[12.5px] font-semibold text-muted-foreground transition-colors hover:text-foreground"
                >
                  Map
                  <LuArrowRight className="size-3.5 -rotate-45" aria-hidden />
                </Link>
              }
            >
              Explore Bolivia
            </SectionTitle>
            <CityExplorer />
          </section>

          <CalendarRow />
        </div>
      )}
    </>
  );
}

function RowSkeletons({ className }: { className?: string }) {
  return (
    <div className={cn("flex flex-col gap-2.5", className)}>
      {[0, 1, 2].map((i) => (
        <Skeleton key={i} className="h-[104px] rounded-[18px]" />
      ))}
    </div>
  );
}
