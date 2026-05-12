"use client";

import Link from "next/link";
import { aiInsights } from "@/lib/mock-data";
import { useDestinations } from "@/hooks/use-destinations";
import { useEvents } from "@/hooks/use-events";
import { useProfile } from "@/hooks/use-profile";
import { SearchBar } from "../search-bar";
import { Section } from "@/components/ui/primitives";

export function HomeScreen() {
  const { data: destinations, loading: loadingD } = useDestinations();
  const { data: events, loading: loadingE } = useEvents();
  const { profile } = useProfile();

  const featured = destinations.slice(0, 4);
  const eventsList = events.slice(0, 3);

  return (
    <div className="flex flex-col gap-5 px-5 pt-3">
      <header>
        <p className="text-[15px] font-medium text-slate-600">
          Hola{profile.name ? `, ${profile.name.split(" ")[0]}` : ""}
        </p>
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
          Explora <span className="text-amber-500">Bolivia 🇧🇴</span>
        </h1>
      </header>

      <SearchBar placeholder="Busca lugares, eventos, guías…" />

      <Section title="Hoy según tu perfil" subtitle="AI Insights">
        <div className="grid grid-cols-3 gap-2.5">
          {aiInsights.map((it) => (
            <div
              key={it.id}
              className={`rounded-2xl bg-gradient-to-br ${it.bg} p-3 text-center shadow-[0_1px_0_rgba(0,0,0,0.04)] ring-1 ring-white/60`}
            >
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-white/70 text-2xl shadow-sm">
                {it.emoji}
              </div>
              <p className="mt-2 text-[10.5px] font-semibold leading-tight text-slate-700">
                {it.label}
              </p>
              <p className="text-[10.5px] font-medium text-slate-500">
                {it.target}
              </p>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Sugerencias locales" subtitle="Curado por IA" action="Ver todo">
        {loadingD ? (
          <SkeletonRow />
        ) : (
          <div className="-mx-5 flex gap-3 overflow-x-auto px-5 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {featured.map((d) => (
              <Link
                key={d.id}
                href={`/place/${d.id}`}
                className="relative w-[180px] shrink-0 overflow-hidden rounded-3xl text-left ring-1 ring-white/60 shadow-[0_8px_24px_-12px_rgba(15,23,42,0.25)]"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={d.img} alt={d.name} className="h-[230px] w-full object-cover" />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent p-3 pt-10 text-white">
                  <p className="text-[10px] font-medium uppercase tracking-wider text-white/80">
                    {d.region}
                  </p>
                  <p className="mt-0.5 text-[15px] font-semibold leading-tight">
                    {d.name}
                  </p>
                  <p className="mt-0.5 text-[11px] text-white/80">{d.tagline}</p>
                </div>
                <span className="absolute right-2.5 top-2.5 rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-semibold text-slate-900">
                  ★ {d.rating}
                </span>
              </Link>
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
              <div
                key={e.id}
                className="flex items-center gap-3 rounded-2xl bg-white/80 p-2.5 ring-1 ring-white shadow-[0_1px_0_rgba(0,0,0,0.04)] backdrop-blur"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={e.img}
                  alt={e.name}
                  className="h-14 w-14 shrink-0 rounded-xl object-cover"
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[14px] font-semibold text-slate-900">
                    {e.name}
                  </p>
                  <p className="text-[12px] text-slate-500">
                    {e.region} · {e.date}
                  </p>
                </div>
                <button className="rounded-full bg-amber-300 px-3 py-1 text-[11px] font-semibold text-slate-900">
                  Ver
                </button>
              </div>
            ))}
          </div>
        )}
      </Section>
    </div>
  );
}

function SkeletonRow() {
  return (
    <div className="-mx-5 flex gap-3 overflow-hidden px-5">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="h-[230px] w-[180px] shrink-0 animate-pulse rounded-3xl bg-white/60"
        />
      ))}
    </div>
  );
}

function SkeletonList() {
  return (
    <div className="flex flex-col gap-2.5">
      {[1, 2, 3].map((i) => (
        <div key={i} className="h-[64px] animate-pulse rounded-2xl bg-white/60" />
      ))}
    </div>
  );
}
