"use client";

// The whole Discover page below the top bar: the navy hero (date, title, city,
// search), then either the browse sections or — the moment you type or tap
// "See all" — the matching events. One client island so the search box can
// swap what's underneath without a round trip.

import { useState } from "react";
import Link from "next/link";
import { LuArrowRight, LuCalendarX, LuChevronLeft, LuSearch, LuX } from "react-icons/lu";

import { useEventFilter } from "@/hooks/use-event-filter";
import { usePreferences } from "@/hooks/use-preferences";
import { useRegistrations } from "@/hooks/use-registrations";
import { EventRow } from "@/components/event/event-row";
import { EventTimeline } from "@/components/event/event-timeline";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { SectionTitle } from "@/components/ui/section-title";
import { IllimaniRidge } from "@/components/ui/brand-icons";
import { InterestRow } from "@/components/discover/interest-row";
import { CalendarRow } from "@/components/discover/calendar-row";
import { CityExplorer } from "@/components/city/city-explorer";
import { findCityByName, HOME_CITY } from "@/lib/cities-seed";
import { cityMeta } from "@/lib/cities-data";
import { cn } from "@/lib/utils";
import type { AygoEvent } from "@/types";

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
  // The "Explore" shortcuts point at your home city (Settings → Interests),
  // the home market until you pick one.
  const { prefs } = usePreferences();
  const home = findCityByName(prefs.homeCity ?? HOME_CITY) ?? findCityByName(HOME_CITY)!;
  const { Icon: HomeMark } = cityMeta(home.name);

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
  // Your interests (Settings → Interests) lead the "Coming up" picks: matching
  // events first, then everything else in date order. Stable, so with no
  // interests chosen it's simply the soonest three.
  const interests = new Set(prefs.interests ?? []);
  const byInterest = (list: typeof filtered) =>
    interests.size === 0
      ? list
      : [...list].sort((a, b) => Number(interests.has(b.category)) - Number(interests.has(a.category)));
  const today = byInterest(filtered.filter((e) => e.dayLabel === "Today")).slice(0, 3);
  // "Coming up" always has its own section (what's next after today), so the
  // interest-first order is visible even on a day that has events of its own.
  const comingUp = byInterest(filtered.filter((e) => e.dayLabel !== "Today")).slice(0, 3);
  const seeAll = (
    <button
      type="button"
      onClick={() => setListAll(true)}
      className="inline-flex items-center gap-1 text-[12.5px] font-semibold text-muted-foreground transition-colors hover:text-foreground"
    >
      See all
      <LuArrowRight className="size-3.5" aria-hidden />
    </button>
  );

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
            href={`/${home.slug}`}
            className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full bg-white/10 pl-2 pr-2.5 text-[13px] font-semibold ring-1 ring-white/15 transition-colors hover:bg-white/15"
          >
            <HomeMark className="size-5 text-gold" aria-hidden />
            Explore {home.name}
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
          {/* A visible way back to the browse view — the X inside the search
              box does the same, but nobody looks for "back" there. */}
          <button
            type="button"
            onClick={clear}
            className="-ml-1 inline-flex h-8 w-fit items-center gap-1 rounded-full pl-1.5 pr-3 text-[13px] font-semibold text-muted-foreground transition-colors hover:bg-secondary/60 hover:text-foreground"
          >
            <LuChevronLeft className="size-4" aria-hidden />
            Back to Discover
          </button>
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

          {today.length > 0 && (
            <section>
              <SectionTitle action={seeAll}>Today</SectionTitle>
              <EventPicks events={today} isGoing={isGoing} />
            </section>
          )}

          {/* With nothing today this is the only "what's on" block, so it also
              carries the loading and empty states. */}
          {(loading || comingUp.length > 0 || today.length === 0) && (
            <section>
              <SectionTitle action={seeAll}>Coming up</SectionTitle>
              {loading ? (
                <RowSkeletons />
              ) : comingUp.length === 0 ? (
                <EmptyState
                  icon={LuCalendarX}
                  title="Nothing on yet"
                  subtitle="More events are on the way."
                />
              ) : (
                <EventPicks events={comingUp} isGoing={isGoing} />
              )}
            </section>
          )}

          <section>
            <SectionTitle
              action={
                <Link
                  href={`/${home.slug}/map`}
                  className="inline-flex items-center gap-1 text-[12.5px] font-semibold text-muted-foreground transition-colors hover:text-foreground"
                >
                  Map
                  <LuArrowRight className="size-3.5 -rotate-45" aria-hidden />
                </Link>
              }
            >
              Explore cities
            </SectionTitle>
            <CityExplorer />
          </section>

          <CalendarRow />
        </div>
      )}
    </>
  );
}

/** Up to three event rows on the gold-dotted rail (a grid from tablet up). */
function EventPicks({
  events,
  isGoing,
}: {
  events: AygoEvent[];
  isGoing: (id: string) => boolean;
}) {
  return (
    <div className="relative flex flex-col gap-2.5 pl-5 md:grid md:grid-cols-2 md:pl-0 lg:grid-cols-3">
      <span
        aria-hidden
        className="absolute bottom-3.5 left-[4.5px] top-3.5 w-px bg-border md:hidden"
      />
      {events.map((e) => (
        <div key={e.id} className="relative">
          <span
            aria-hidden
            className="absolute -left-5 top-1/2 size-2.5 -translate-y-1/2 rounded-full bg-gold ring-4 ring-background md:hidden"
          />
          <EventRow event={e} going={isGoing(e.id)} />
        </div>
      ))}
    </div>
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
