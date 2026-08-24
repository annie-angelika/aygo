"use client";

// "For you": events ranked by your interests, home city and what you're
// attending (lib/recommend). Until we know anything about you, it's a nudge to
// pick interests instead of an empty row.

import Link from "next/link";
import { LuSparkles } from "react-icons/lu";

import { SectionTitle } from "@/components/ui/section-title";
import { Skeleton } from "@/components/ui/skeleton";
import { EventTile } from "@/components/event/event-tile";
import { useRecommendations } from "@/hooks/use-recommendations";

export function ForYouRow() {
  const { events, loading, hydrated, personalized } = useRecommendations(8);

  if (!hydrated) return null;

  return (
    <section>
      <SectionTitle
        action={
          <Link
            href="/settings/preferences"
            className="text-[12.5px] font-semibold text-muted-foreground transition-colors hover:text-foreground"
          >
            {personalized ? "Tune" : "Set up"}
          </Link>
        }
      >
        For you
      </SectionTitle>
      {!personalized ? (
        <Link
          href="/settings/preferences"
          className="flex items-center gap-3 rounded-2xl bg-card px-4 py-3.5 ring-1 ring-border transition-colors hover:bg-muted/60"
        >
          <span className="grid size-10 shrink-0 place-items-center rounded-full bg-amber-100 text-amber-700">
            <LuSparkles className="size-5" aria-hidden />
          </span>
          <span className="min-w-0">
            <span className="block text-[13.5px] font-semibold text-foreground">
              Tell us what you like
            </span>
            <span className="block text-[12px] leading-snug text-muted-foreground">
              Pick a few interests and your city — we&apos;ll pull the best plans to the top.
            </span>
          </span>
        </Link>
      ) : loading && events.length === 0 ? (
        <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-52 w-44 shrink-0 rounded-2xl" />
          ))}
        </div>
      ) : events.length === 0 ? (
        <p className="rounded-2xl bg-card/60 px-4 py-5 text-center text-[12.5px] text-muted-foreground ring-1 ring-border">
          Nothing matches your interests yet — browse everything below.
        </p>
      ) : (
        <div className="no-scrollbar -mx-4 overflow-x-auto py-1">
          <div className="flex w-max gap-2 px-4">
            {events.map((e) => (
              <EventTile key={e.id} event={e} />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
