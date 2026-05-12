"use client";

import Link from "next/link";
import { useState } from "react";
import { useDestinations } from "@/hooks/use-destinations";
import { useSavedPlaces } from "@/hooks/use-saved-places";
import type { Destination } from "@/types";
import { SearchBar } from "../search-bar";
import { Section } from "@/components/ui/primitives";
import { HeartIcon, PinIcon } from "@/components/ui/icons";

const FILTERS = [
  "Imperdibles",
  "Joyas escondidas",
  "Naturaleza",
  "Cultura",
  "Comida",
] as const;

type Filter = (typeof FILTERS)[number];

export function VibesScreen() {
  const { data: destinations, loading } = useDestinations();
  const [active, setActive] = useState<Filter>("Imperdibles");

  const visible = destinations.filter((d) => filterFn(d, active));
  const hero = destinations[0];
  const grid = visible.slice(0, 4);
  const hidden = destinations.slice(4, 7);

  return (
    <div className="flex flex-col gap-5 px-5 pt-3">
      <header>
        <p className="text-[15px] font-medium text-slate-600">Explora nuevos</p>
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900">Vibes</h1>
      </header>

      <SearchBar placeholder="Busca por vibe, lugar, etiqueta…" />

      <div className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setActive(f)}
            className={`shrink-0 rounded-full px-4 py-1.5 text-[12.5px] font-semibold transition-colors ${
              active === f
                ? "bg-amber-300 text-slate-900"
                : "bg-white/70 text-slate-700 ring-1 ring-white"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {hero && (
        <Link
          href={`/place/${hero.id}`}
          className="relative block h-[150px] w-full overflow-hidden rounded-3xl text-left ring-1 ring-white/60"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={hero.hero} alt={hero.name} className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-semibold text-slate-900">
            Base camp
          </span>
          <div className="absolute inset-x-3 bottom-3 flex items-center gap-2 text-white">
            <PinIcon />
            <p className="text-[14px] font-semibold leading-tight">
              Recomendado: campamento en {hero.name}
            </p>
          </div>
        </Link>
      )}

      <Section title="Imperdibles de hoy" subtitle="Ruta sugerida por IA" action="Ver todo">
        {loading ? (
          <SkeletonGrid />
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {grid.map((d) => (
              <DestinationCard key={d.id} destination={d} />
            ))}
          </div>
        )}
      </Section>

      <Section title="Joyas escondidas cerca">
        <div className="flex flex-col gap-2.5">
          {hidden.map((d) => (
            <Link
              key={d.id}
              href={`/place/${d.id}`}
              className="flex w-full items-center gap-3 rounded-2xl bg-white/80 p-2.5 text-left ring-1 ring-white backdrop-blur"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={d.img}
                alt={d.name}
                className="h-14 w-14 shrink-0 rounded-xl object-cover"
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-[14px] font-semibold text-slate-900">
                  {d.name}
                </p>
                <p className="truncate text-[12px] text-slate-500">
                  {d.region} · {d.tagline}
                </p>
              </div>
              <span className="rounded-full bg-slate-900 px-2 py-0.5 text-[10.5px] font-semibold text-white">
                ★ {d.rating}
              </span>
            </Link>
          ))}
        </div>
      </Section>
    </div>
  );
}

function filterFn(d: Destination, active: Filter): boolean {
  switch (active) {
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
}

// Heart save button lives as a sibling of the Link inside a relative container
// so the click handlers don't fight each other and we avoid nested <a>/<button>.
function DestinationCard({ destination: d }: { destination: Destination }) {
  const { isSaved, toggle, hydrated } = useSavedPlaces();
  const saved = hydrated && isSaved(d.id);
  return (
    <div className="relative">
      <Link
        href={`/place/${d.id}`}
        className="relative block h-[180px] w-full overflow-hidden rounded-3xl text-left ring-1 ring-white/60 shadow-[0_8px_24px_-12px_rgba(15,23,42,0.25)]"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={d.img} alt={d.name} className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/15 to-transparent" />
        <div className="absolute inset-x-3 bottom-2.5 text-white">
          <p className="text-[10px] font-medium uppercase tracking-wider text-white/80">
            {d.region}
          </p>
          <p className="text-[13.5px] font-semibold leading-tight">{d.name}</p>
        </div>
      </Link>
      <button
        type="button"
        aria-label={saved ? "Quitar de guardados" : "Guardar"}
        aria-pressed={saved}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          toggle(d.id);
        }}
        className={`absolute right-2.5 top-2.5 z-10 grid size-7 place-items-center rounded-full transition-colors ${
          saved ? "bg-rose-500 text-white" : "bg-white/90 text-slate-900"
        }`}
      >
        <HeartIcon filled={saved} />
      </button>
    </div>
  );
}

function SkeletonGrid() {
  return (
    <div className="grid grid-cols-2 gap-3">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="h-[180px] animate-pulse rounded-3xl bg-white/60" />
      ))}
    </div>
  );
}
