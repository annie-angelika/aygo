"use client";

import Link from "next/link";
import { useState } from "react";
import { useDestinations } from "@/hooks/use-destinations";
import type { Destination } from "@/types";

import { SearchBar } from "@/components/search-bar";
import { ScreenHeader } from "@/components/ui/screen-header";
import { Section } from "@/components/ui/primitives";
import { FilterPills } from "@/components/ui/filter-pills";
import { SkeletonGrid } from "@/components/ui/skeleton";
import { DestinationTile } from "@/components/cards/destination-tile";
import { DestinationListItem } from "@/components/cards/destination-list-item";
import { PinIcon } from "@/components/ui/icons";

const FILTERS = [
  "Imperdibles",
  "Joyas escondidas",
  "Naturaleza",
  "Cultura",
  "Comida",
] as const;

type Filter = (typeof FILTERS)[number];

const matchesFilter = (d: Destination, f: Filter): boolean => {
  switch (f) {
    case "Imperdibles":
      return true;
    case "Joyas escondidas":
      return d.reviews < 300;
    case "Naturaleza":
      return d.vibe === "Naturaleza";
    case "Cultura":
      return d.vibe === "Cultura";
    case "Comida":
      return d.vibe === "Gastronomía";
  }
};

export function VibesScreen() {
  const { data: destinations, loading } = useDestinations();
  const [active, setActive] = useState<Filter>("Imperdibles");

  const grid = destinations.filter((d) => matchesFilter(d, active)).slice(0, 4);
  const hero = destinations[0];
  const hidden = destinations.slice(4, 7);

  return (
    <div className="flex flex-col gap-5 px-5 pt-3">
      <ScreenHeader eyebrow="Explora nuevos" title="Vibes" />

      <SearchBar placeholder="Busca por vibe, lugar, etiqueta…" />

      <FilterPills items={FILTERS} active={active} onSelect={setActive} />

      {hero && <VibesHero destination={hero} />}

      <Section
        title="Imperdibles de hoy"
        subtitle="Ruta sugerida por IA"
        action="Ver todo"
      >
        {loading ? (
          <SkeletonGrid />
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {grid.map((d) => (
              <DestinationTile key={d.id} destination={d} />
            ))}
          </div>
        )}
      </Section>

      <Section title="Joyas escondidas cerca">
        <div className="flex flex-col gap-2.5">
          {hidden.map((d) => (
            <DestinationListItem key={d.id} destination={d} />
          ))}
        </div>
      </Section>
    </div>
  );
}

/** Featured "base camp" banner — one-off composition, kept local. */
function VibesHero({ destination: d }: { destination: Destination }) {
  return (
    <Link
      href={`/place/${d.id}`}
      className="relative block h-[150px] w-full overflow-hidden rounded-3xl text-left ring-1 ring-white/60"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={d.hero} alt={d.name} className="h-full w-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
      <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-semibold text-slate-900">
        Base camp
      </span>
      <div className="absolute inset-x-3 bottom-3 flex items-center gap-2 text-white">
        <PinIcon />
        <p className="text-[14px] font-semibold leading-tight">
          Recomendado: campamento en {d.name}
        </p>
      </div>
    </Link>
  );
}
