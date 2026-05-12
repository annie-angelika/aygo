"use client";

import Link from "next/link";
import { useState } from "react";
import { useDestinations } from "@/hooks/use-destinations";
import { useTrips } from "@/hooks/use-trips";

export function JournalScreen() {
  const { data: destinations, loading } = useDestinations();
  const { trips, hydrated } = useTrips();
  const [view, setView] = useState<"timeline" | "story">("timeline");

  // Two sources of trips: the few sample trips we always show + any trips
  // the user actually saved from the Plan screen.
  const sampleTrips = destinations.length
    ? [
        { d: destinations[1], when: "Hace 2 semanas", tags: ["Aventura", "Pareja"] },
        { d: destinations[4], when: "Mar · 3 días", tags: ["Naturaleza", "Selva"] },
        { d: destinations[5], when: "Ene", tags: ["Cultura", "Familia"] },
      ]
    : [];

  const savedTrips = hydrated
    ? trips
        .map((t) => {
          const d = destinations.find((dest) => dest.id === t.destinationId);
          if (!d) return null;
          return {
            d,
            when: t.startDate ?? "Guardado",
            tags: [t.status === "draft" ? "Borrador" : "Confirmado", t.budget],
          };
        })
        .filter((x): x is { d: NonNullable<typeof x>["d"]; when: string; tags: string[] } => x !== null)
    : [];

  const all = [...savedTrips, ...sampleTrips];

  return (
    <div className="flex flex-col gap-5 px-5 pt-3">
      <header>
        <p className="text-[15px] font-medium text-slate-600">Tu diario de viajes</p>
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
          Aygo Journal
        </h1>
      </header>

      <div className="inline-flex w-fit gap-1 rounded-full bg-white/70 p-1 ring-1 ring-white">
        {(["timeline", "story"] as const).map((v) => (
          <button
            key={v}
            onClick={() => setView(v)}
            className={`rounded-full px-4 py-1.5 text-[12.5px] font-semibold transition-colors ${
              view === v ? "bg-slate-900 text-white" : "text-slate-600"
            }`}
          >
            {v === "timeline" ? "Línea de tiempo" : "Modo historia"}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex flex-col gap-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-[160px] animate-pulse rounded-3xl bg-white/60" />
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {all.map((t, i) => (
            <Link
              key={`${t.d.id}-${i}`}
              href={`/place/${t.d.id}`}
              className="relative block h-[160px] w-full overflow-hidden rounded-3xl text-left ring-1 ring-white/60 shadow-[0_8px_24px_-14px_rgba(15,23,42,0.3)]"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={t.d.hero} alt={t.d.name} className="h-full w-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/15 to-transparent" />
              <div className="absolute right-2.5 top-2.5 flex flex-col gap-1.5">
                <span className="grid size-8 place-items-center rounded-full bg-white/85 text-[10.5px] font-semibold text-slate-900">
                  +{Math.floor(t.d.reviews / 100)}
                </span>
                <span className="grid size-8 place-items-center rounded-full bg-white/85 text-[10.5px] font-semibold text-rose-500">
                  ♥
                </span>
              </div>
              <div className="absolute inset-x-3 bottom-3 text-white">
                <p className="text-[10.5px] font-medium uppercase tracking-wider text-white/80">
                  {t.d.region} · {t.when}
                </p>
                <p className="text-[18px] font-semibold leading-tight">{t.d.name}</p>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {t.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-semibold capitalize backdrop-blur"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
