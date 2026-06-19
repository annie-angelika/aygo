"use client";

import type { IconType } from "react-icons";
import { LuTrendingUp, LuSun, LuGem, LuMapPin } from "react-icons/lu";

import { useDestinations } from "@/hooks/use-destinations";
import { useEvents } from "@/hooks/use-events";
import { useProfile } from "@/hooks/use-profile";
import { aiInsights } from "@/lib/mock-data";

import { SearchBar } from "@/components/search-bar";
import { ScreenHeader } from "@/components/ui/screen-header";
import { Section } from "@/components/ui/primitives";
import { SkeletonCarousel, SkeletonList } from "@/components/ui/skeleton";
import { AiInsightCard } from "@/components/cards/ai-insight-card";
import { AiPickCard } from "@/components/cards/ai-pick-card";
import { DestinationCard } from "@/components/cards/destination-card";
import { EventsCalendar } from "@/components/cards/events-calendar";
import { Skeleton } from "@/components/ui/skeleton";

// react-icon per insight, keyed by the mock-data id. Tiles share one calm
// surface and a single brand accent — identity without the rainbow.
const INSIGHT_ICONS: Record<string, IconType> = {
  trending: LuTrendingUp,
  weather: LuSun,
  hidden: LuGem,
};

export function HomeScreen() {
  const { data: destinations, loading: loadingD } = useDestinations();
  const { data: events, loading: loadingE } = useEvents();
  const { profile } = useProfile();

  const firstName = profile.name?.split(" ")[0];
  const initials =
    profile.name
      ?.split(" ")
      .map((w) => w[0])
      .filter(Boolean)
      .slice(0, 2)
      .join("")
      .toUpperCase() ?? "";
  const aiPick = destinations[0];
  const featured = destinations.slice(1, 5);
  const eventsList = events.slice(0, 4);

  return (
    <div className="flex flex-col gap-6 px-5 pt-4">
      <ScreenHeader
        eyebrow={`Hola${firstName ? `, ${firstName}` : ""}`}
        title="Explora"
        accent={
          <span className="inline-flex items-center gap-1.5">
            <LuMapPin className="size-5" aria-hidden />
            Bolivia
          </span>
        }
        trailing={
          <div className="grid size-11 place-items-center rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 text-[14px] font-semibold text-white ring-1 ring-white/20 shadow-[0_10px_24px_-8px_rgba(217,70,239,0.7)]">
            {initials}
          </div>
        }
        tone="dark"
      />

      <SearchBar placeholder="Busca lugares, eventos, guías…" tone="dark" />

      {/* Quick vibes — one calm, uniform row of clean tags. */}
      <div className="flex flex-wrap gap-2">
        {profile.interests.map((v) => (
          <button
            key={v}
            className="rounded-full bg-white/[0.05] px-3.5 py-1.5 text-[12.5px] font-medium text-violet-100 ring-1 ring-white/[0.12] backdrop-blur transition active:scale-95"
          >
            {v}
          </button>
        ))}
      </div>

      {loadingD ? (
        <Skeleton tone="dark" className="h-[184px] rounded-3xl" />
      ) : (
        aiPick && <AiPickCard destination={aiPick} />
      )}

      <Section title="Hoy según tu perfil" subtitle="AI Insights" tone="dark">
        <div className="grid grid-cols-3 gap-2.5">
          {aiInsights.map((it) => {
            const Icon = INSIGHT_ICONS[it.id];
            return (
              <AiInsightCard
                key={it.id}
                label={it.label}
                target={it.target}
                icon={
                  Icon ? (
                    <Icon
                      className="size-[26px] text-fuchsia-300 drop-shadow-[0_3px_10px_rgba(232,121,249,0.45)]"
                      aria-hidden
                    />
                  ) : undefined
                }
                tone="dark"
              />
            );
          })}
        </div>
      </Section>

      <Section
        title="Sugerencias locales"
        subtitle="Curado por IA"
        action="Ver todo"
        tone="dark"
      >
        {loadingD ? (
          <SkeletonCarousel tone="dark" />
        ) : (
          <div className="-mx-5 flex gap-3.5 overflow-x-auto px-5 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {featured.map((d) => (
              <DestinationCard key={d.id} destination={d} />
            ))}
          </div>
        )}
      </Section>

      <Section
        title="Eventos cerca"
        subtitle="Agenda"
        action="Ver todo"
        tone="dark"
      >
        {loadingE ? (
          <SkeletonList tone="dark" />
        ) : (
          <EventsCalendar events={eventsList} />
        )}
      </Section>
    </div>
  );
}
