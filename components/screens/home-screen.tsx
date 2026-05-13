"use client";

import { useDestinations } from "@/hooks/use-destinations";
import { useEvents } from "@/hooks/use-events";
import { useProfile } from "@/hooks/use-profile";
import { aiInsights } from "@/lib/mock-data";

import { SearchBar } from "@/components/search-bar";
import { ScreenHeader } from "@/components/ui/screen-header";
import { Section } from "@/components/ui/primitives";
import { SkeletonCarousel, SkeletonList } from "@/components/ui/skeleton";
import { AiInsightCard } from "@/components/cards/ai-insight-card";
import { DestinationCard } from "@/components/cards/destination-card";
import { EventRow } from "@/components/cards/event-row";

export function HomeScreen() {
  const { data: destinations, loading: loadingD } = useDestinations();
  const { data: events, loading: loadingE } = useEvents();
  const { profile } = useProfile();

  const firstName = profile.name?.split(" ")[0];
  const featured = destinations.slice(0, 4);
  const eventsList = events.slice(0, 3);

  return (
    <div className="flex flex-col gap-5 px-5 pt-3">
      <ScreenHeader
        eyebrow={`Hola${firstName ? `, ${firstName}` : ""}`}
        title="Explora"
        accent="Bolivia 🇧🇴"
      />

      <SearchBar placeholder="Busca lugares, eventos, guías…" />

      <Section title="Hoy según tu perfil" subtitle="AI Insights">
        <div className="grid grid-cols-3 gap-2.5">
          {aiInsights.map((it) => (
            <AiInsightCard key={it.id} {...it} />
          ))}
        </div>
      </Section>

      <Section
        title="Sugerencias locales"
        subtitle="Curado por IA"
        action="Ver todo"
      >
        {loadingD ? (
          <SkeletonCarousel />
        ) : (
          <div className="-mx-5 flex gap-3 overflow-x-auto px-5 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {featured.map((d) => (
              <DestinationCard key={d.id} destination={d} />
            ))}
          </div>
        )}
      </Section>

      <Section title="Eventos cerca" action="Ver todo">
        {loadingE ? (
          <SkeletonList />
        ) : (
          <div className="flex flex-col gap-2.5">
            {eventsList.map((e) => (
              <EventRow key={e.id} event={e} />
            ))}
          </div>
        )}
      </Section>
    </div>
  );
}
