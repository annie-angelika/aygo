"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Destination, Event, Guide } from "@/types";
import { useRecentSearches } from "@/hooks/use-recent-searches";
import { useSearch } from "@/hooks/use-search";
import { SearchIcon, MicIcon } from "@/components/ui/icons";

const QUICK_SUGGESTIONS = ["Uyuni", "La Paz", "Naturaleza", "Carnaval", "Santa Cruz"];

export function SearchBar({ placeholder }: { placeholder: string }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);
  const { data, loading, hasResults } = useSearch(query);
  const { recent, push, clear } = useRecentSearches();

  const showPanel = focused;
  const showResults = query.trim().length > 0;

  const pickDestination = (d: Destination) => {
    push(d.name);
    setQuery("");
    setFocused(false);
    router.push(`/place/${d.id}`);
  };

  const pickQuery = (q: string) => {
    setQuery(q);
  };

  const closeWithQuery = () => {
    if (query.trim()) push(query);
    setQuery("");
    setFocused(false);
  };

  return (
    <div className="relative">
      <div className="flex items-center gap-2 rounded-2xl bg-white/80 px-3.5 py-3 ring-1 ring-white shadow-[0_1px_0_rgba(0,0,0,0.04)] backdrop-blur focus-within:ring-amber-300">
        <SearchIcon className="text-slate-400" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setFocused(true)}
          // Delay so a click inside the dropdown registers before it closes.
          onBlur={() => setTimeout(() => setFocused(false), 120)}
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              setQuery("");
              (e.target as HTMLInputElement).blur();
            }
            if (e.key === "Enter" && data.destinations[0]) {
              pickDestination(data.destinations[0]);
            }
          }}
          placeholder={placeholder}
          className="flex-1 bg-transparent text-[13px] text-slate-700 placeholder:text-slate-400 outline-none"
        />
        {query ? (
          <button
            aria-label="Limpiar"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => setQuery("")}
            className="grid size-5 place-items-center rounded-full bg-slate-200 text-[11px] text-slate-600"
          >
            ×
          </button>
        ) : (
          <span aria-hidden className="text-slate-500">
            <MicIcon />
          </span>
        )}
      </div>

      {showPanel && (
        <div
          onMouseDown={(e) => e.preventDefault()}
          className="absolute inset-x-0 top-[calc(100%+8px)] z-30 max-h-[60vh] overflow-y-auto rounded-2xl bg-white/95 p-2 shadow-[0_18px_40px_-18px_rgba(15,23,42,0.35)] ring-1 ring-slate-200/70 backdrop-blur"
        >
          {!showResults && (
            <EmptyState
              recent={recent}
              onClearRecent={clear}
              onPick={pickQuery}
            />
          )}

          {showResults && loading && (
            <p className="px-3 py-3 text-[12.5px] text-slate-500">Buscando…</p>
          )}

          {showResults && !loading && !hasResults && (
            <p className="px-3 py-4 text-[12.5px] text-slate-500">
              Sin coincidencias para{" "}
              <span className="font-semibold text-slate-700">“{query}”</span>.
              Probá con “Uyuni”, “Carnaval” o “Santa Cruz”.
            </p>
          )}

          {data.destinations.length > 0 && (
            <ResultGroup title={`Destinos · ${data.destinations.length}`}>
              {data.destinations.map((d) => (
                <button
                  key={d.id}
                  onClick={() => pickDestination(d)}
                  className="flex w-full items-center gap-3 rounded-xl p-2 text-left hover:bg-amber-50"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={d.img}
                    alt=""
                    className="size-10 shrink-0 rounded-lg object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] font-semibold text-slate-900">
                      {d.name}
                    </p>
                    <p className="truncate text-[11.5px] text-slate-500">
                      {d.region} · {d.vibe} · Bs {d.priceFrom}
                    </p>
                  </div>
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10.5px] font-semibold text-slate-700">
                    ★ {d.rating}
                  </span>
                </button>
              ))}
            </ResultGroup>
          )}

          {data.events.length > 0 && (
            <ResultGroup title={`Eventos · ${data.events.length}`}>
              {data.events.map((e) => (
                <EventResult key={e.id} ev={e} onPick={closeWithQuery} />
              ))}
            </ResultGroup>
          )}

          {data.guides.length > 0 && (
            <ResultGroup title={`Guías · ${data.guides.length}`}>
              {data.guides.map((g) => (
                <GuideResult key={g.id} guide={g} onPick={closeWithQuery} />
              ))}
            </ResultGroup>
          )}
        </div>
      )}
    </div>
  );
}

function EmptyState({
  recent,
  onClearRecent,
  onPick,
}: {
  recent: string[];
  onClearRecent: () => void;
  onPick: (q: string) => void;
}) {
  return (
    <div className="px-2 py-2">
      {recent.length > 0 && (
        <>
          <div className="flex items-center justify-between">
            <p className="text-[10.5px] font-semibold uppercase tracking-wider text-slate-500">
              Recientes
            </p>
            <button
              onClick={onClearRecent}
              className="text-[10.5px] font-semibold text-slate-500"
            >
              Limpiar
            </button>
          </div>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {recent.map((r) => (
              <button
                key={r}
                onClick={() => onPick(r)}
                className="rounded-full bg-slate-100 px-3 py-1 text-[12px] font-semibold text-slate-700 ring-1 ring-slate-200"
              >
                {r}
              </button>
            ))}
          </div>
          <div className="my-3 h-px bg-slate-100" />
        </>
      )}

      <p className="text-[10.5px] font-semibold uppercase tracking-wider text-slate-500">
        Pruebas rápidas
      </p>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {QUICK_SUGGESTIONS.map((s) => (
          <button
            key={s}
            onClick={() => onPick(s)}
            className="rounded-full bg-amber-50 px-3 py-1 text-[12px] font-semibold text-slate-700 ring-1 ring-amber-200"
          >
            {s}
          </button>
        ))}
      </div>
      <p className="mt-3 text-[11px] text-slate-500">
        Probá un destino (“Uyuni”), una región (“La Paz”), una vibe
        (“Naturaleza”) o el nombre de un guía.
      </p>
    </div>
  );
}

function EventResult({ ev, onPick }: { ev: Event; onPick: () => void }) {
  return (
    <button
      onClick={onPick}
      className="flex w-full items-center gap-3 rounded-xl p-2 text-left hover:bg-amber-50"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={ev.img}
        alt=""
        className="size-10 shrink-0 rounded-lg object-cover"
      />
      <div className="min-w-0 flex-1">
        <p className="truncate text-[13px] font-semibold text-slate-900">
          {ev.name}
        </p>
        <p className="truncate text-[11.5px] text-slate-500">
          {ev.region} · {ev.date}
        </p>
      </div>
      <span className="rounded-full bg-amber-200 px-2 py-0.5 text-[10.5px] font-semibold text-slate-900">
        {ev.vibe}
      </span>
    </button>
  );
}

function GuideResult({ guide, onPick }: { guide: Guide; onPick: () => void }) {
  return (
    <button
      onClick={onPick}
      className="flex w-full items-center gap-3 rounded-xl p-2 text-left hover:bg-amber-50"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={guide.avatar}
        alt=""
        className="size-10 shrink-0 rounded-full object-cover"
      />
      <div className="min-w-0 flex-1">
        <p className="truncate text-[13px] font-semibold text-slate-900">
          {guide.name} <span className="text-slate-400">· {guide.city}</span>
        </p>
        <p className="truncate text-[11.5px] text-slate-500">
          {guide.focus} · {guide.trips} viajes
        </p>
      </div>
      <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10.5px] font-semibold text-emerald-700">
        ★ {guide.rating}
      </span>
    </button>
  );
}

function ResultGroup({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="px-1 pb-1 last:pb-0">
      <p className="px-2 pt-2 pb-1 text-[10.5px] font-semibold uppercase tracking-wider text-slate-500">
        {title}
      </p>
      <div className="flex flex-col">{children}</div>
    </div>
  );
}

// Re-exported for screens that want to link to a destination card.
export function DestinationLink({
  id,
  className,
  children,
}: {
  id: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <Link href={`/place/${id}`} className={className}>
      {children}
    </Link>
  );
}
