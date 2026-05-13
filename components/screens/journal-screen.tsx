"use client";

import { useState } from "react";
import { useDestinations } from "@/hooks/use-destinations";
import { useTrips } from "@/hooks/use-trips";
import type { Destination } from "@/types";

import { ScreenHeader } from "@/components/ui/screen-header";
import { SegmentedToggle } from "@/components/ui/segmented-toggle";
import { SkeletonList } from "@/components/ui/skeleton";
import { TripCard } from "@/components/cards/trip-card";

type JournalView = "timeline" | "story";

const VIEW_OPTIONS = [
  { value: "timeline" as const, label: "Línea de tiempo" },
  { value: "story" as const, label: "Modo historia" },
];

type JournalEntry = {
  destination: Destination;
  when: string;
  tags: string[];
};

export function JournalScreen() {
  const { data: destinations, loading } = useDestinations();
  const { trips, hydrated } = useTrips();
  const [view, setView] = useState<JournalView>("timeline");

  // Two sources: a few sample trips for visual ballast, plus any trip the
  // user saved from the Plan screen (front-of-list so it shows up first).
  const samples: JournalEntry[] = destinations.length
    ? [
        { destination: destinations[1], when: "Hace 2 semanas", tags: ["Aventura", "Pareja"] },
        { destination: destinations[4], when: "Mar · 3 días", tags: ["Naturaleza", "Selva"] },
        { destination: destinations[5], when: "Ene", tags: ["Cultura", "Familia"] },
      ]
    : [];

  const saved: JournalEntry[] = hydrated
    ? trips
        .map((t) => {
          const d = destinations.find((dest) => dest.id === t.destinationId);
          if (!d) return null;
          return {
            destination: d,
            when: t.startDate ?? "Guardado",
            tags: [t.status === "draft" ? "Borrador" : "Confirmado", t.budget],
          };
        })
        .filter((x): x is JournalEntry => x !== null)
    : [];

  const entries = [...saved, ...samples];

  return (
    <div className="flex flex-col gap-5 px-5 pt-3">
      <ScreenHeader eyebrow="Tu diario de viajes" title="Aygo Journal" />

      <SegmentedToggle options={VIEW_OPTIONS} value={view} onChange={setView} />

      {loading ? (
        <SkeletonList itemClassName="h-[160px] rounded-3xl" />
      ) : (
        <div className="flex flex-col gap-3">
          {entries.map((entry, i) => (
            <TripCard
              key={`${entry.destination.id}-${i}`}
              destination={entry.destination}
              when={entry.when}
              tags={entry.tags}
            />
          ))}
        </div>
      )}
    </div>
  );
}
