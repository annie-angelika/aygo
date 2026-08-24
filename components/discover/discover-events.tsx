"use client";

// The Discover board: every upcoming event, searchable and filterable by
// interest, city, date range and price. The three async states are covered:
// skeletons, a "nothing matches" empty state with a clear action, and the list.

import { LuSearch, LuCalendarX, LuX } from "react-icons/lu";

import { useRegistrations } from "@/hooks/use-registrations";
import { useEventFilter, activeFilterCount, DEFAULT_EXTRA } from "@/hooks/use-event-filter";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { EventTimeline } from "@/components/event/event-timeline";
import { FilterSheet } from "@/components/discover/filter-sheet";
import { CATEGORIES } from "@/lib/events-data";
import type { Category } from "@/types";

export function DiscoverEvents() {
  const { isGoing } = useRegistrations();
  const { loading, interest, setInterest, filtered, extra, setExtra, resetExtra } =
    useEventFilter({ upcomingOnly: true });
  const narrowed = activeFilterCount(extra) > 0 || interest !== "all" || !!extra.query;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2 rounded-xl bg-card px-3 ring-1 ring-border focus-within:ring-2 focus-within:ring-ring">
        <LuSearch className="size-4 shrink-0 text-muted-foreground" aria-hidden />
        <input
          value={extra.query}
          onChange={(e) => setExtra({ ...extra, query: e.target.value })}
          placeholder="Search events, places, hosts…"
          aria-label="Search events"
          className="h-10 w-full bg-transparent text-[13px] text-foreground outline-none placeholder:text-muted-foreground"
        />
        {extra.query && (
          <button
            type="button"
            aria-label="Clear search"
            onClick={() => setExtra({ ...extra, query: "" })}
            className="grid size-6 place-items-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <LuX className="size-3.5" aria-hidden />
          </button>
        )}
      </div>

      <div className="flex items-center justify-between gap-2">
        <Select value={interest} onValueChange={(v) => setInterest(v as Category | "all")}>
          <SelectTrigger size="sm" className="w-[150px]">
            <SelectValue>{(val: string) => (val === "all" ? "All interests" : val)}</SelectValue>
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
        <FilterSheet value={extra} onChange={setExtra} onReset={resetExtra} />
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
          title={narrowed ? "Nothing matches" : "Nothing upcoming yet"}
          subtitle={
            narrowed
              ? "Try another city, a wider date range, or clear the filters."
              : "More events are on the way — or host one yourself."
          }
          action={
            narrowed ? (
              <Button
                variant="outline"
                className="rounded-full"
                onClick={() => {
                  setExtra(DEFAULT_EXTRA);
                  setInterest("all");
                }}
              >
                Clear everything
              </Button>
            ) : undefined
          }
        />
      ) : (
        <EventTimeline events={filtered} isGoing={isGoing} groupBy="month" stickyOffset="top-14" />
      )}
    </div>
  );
}
