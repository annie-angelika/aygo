"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useDestinations } from "@/hooks/use-destinations";
import { useProfile } from "@/hooks/use-profile";
import { useTrips } from "@/hooks/use-trips";
import type { Trip } from "@/types";
import { BackButton, MoreButton } from "@/components/ui/primitives";
import { PinIcon } from "@/components/ui/icons";

const DAY_LABELS = ["L", "M", "M", "J", "V", "S", "D"];

export function PlanScreen() {
  const { data: destinations, loading } = useDestinations();
  const { profile, patch } = useProfile();
  const { upsert } = useTrips();

  // Pick the first destination as the active selection for the mockup.
  const dest = destinations[0];

  const days = useMemo(() => {
    const today = new Date();
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      return d;
    });
  }, []);

  const [selectedDay, setSelectedDay] = useState(2);

  const confirm = () => {
    if (!dest) return;
    const trip: Trip = {
      id: `trip-${Date.now()}`,
      destinationId: dest.id,
      startDate: days[selectedDay].toISOString().slice(0, 10),
      endDate: days[selectedDay].toISOString().slice(0, 10),
      budget: profile.budget,
      status: "draft",
      createdAt: new Date().toISOString(),
    };
    upsert(trip);
    // Reflect the picked start date into the profile too.
    patch({ startDate: trip.startDate });
  };

  return (
    <div className="flex flex-col gap-5 px-5 pt-3">
      <header className="flex items-center justify-between">
        <BackButton />
        <h1 className="text-[15px] font-semibold text-slate-900">Planificar viaje</h1>
        <MoreButton />
      </header>

      {loading || !dest ? (
        <div className="h-[120px] animate-pulse rounded-3xl bg-white/60" />
      ) : (
        <Link
          href={`/place/${dest.id}`}
          className="relative block h-[120px] w-full overflow-hidden rounded-3xl text-left ring-1 ring-white/60"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={dest.hero} alt={dest.name} className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/55 via-black/15 to-transparent" />
          <div className="absolute inset-y-0 left-4 flex flex-col justify-center text-white">
            <span className="inline-flex items-center gap-1.5 text-[11px]">
              <PinIcon /> Destino
            </span>
            <p className="mt-1 text-[18px] font-semibold leading-tight">
              {dest.name}, {dest.region}
            </p>
          </div>
          <span className="absolute right-3 top-3 rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-semibold text-slate-900">
            Cambiar
          </span>
        </Link>
      )}

      <div className="rounded-3xl bg-white/80 p-4 ring-1 ring-white backdrop-blur">
        <div className="flex items-center justify-between">
          <p className="text-[15px] font-semibold text-slate-900">Fechas y presupuesto</p>
          <button onClick={confirm} className="text-[12.5px] font-semibold text-blue-500">
            Guardar
          </button>
        </div>

        <div className="mt-3 grid grid-cols-7 gap-1.5 text-center">
          {DAY_LABELS.map((d, i) => (
            <p key={i} className="text-[10.5px] font-semibold uppercase text-slate-500">
              {d}
            </p>
          ))}
          {days.map((d, i) => {
            const isActive = selectedDay === i;
            return (
              <button
                key={d.toISOString()}
                onClick={() => setSelectedDay(i)}
                className={`mx-auto grid size-9 place-items-center rounded-full text-[13px] font-semibold transition-colors ${
                  isActive
                    ? "bg-blue-500 text-white"
                    : "bg-blue-50 text-slate-700 hover:bg-blue-100"
                }`}
              >
                {d.getDate()}
              </button>
            );
          })}
        </div>

        <div className="mt-5">
          <p className="text-[12.5px] font-semibold uppercase tracking-wider text-slate-500">
            Presupuesto
          </p>
          <div className="mt-2 flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
            <span className="text-[20px] font-semibold text-slate-900">
              Bs {budgetToAmount(profile.budget)}
            </span>
            <span className="text-[11px] text-slate-500">por persona</span>
          </div>
          <div className="mt-3 flex gap-2">
            {(["bajo", "medio", "alto"] as const).map((tier) => (
              <button
                key={tier}
                onClick={() => patch({ budget: tier })}
                className={`flex-1 rounded-full py-1.5 text-[12px] font-semibold capitalize ${
                  profile.budget === tier
                    ? "bg-slate-900 text-white"
                    : "bg-white text-slate-700 ring-1 ring-slate-200"
                }`}
              >
                {tier}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-3xl bg-white/80 p-4 ring-1 ring-white backdrop-blur">
        <div className="flex items-center justify-between">
          <p className="text-[15px] font-semibold text-slate-900">Estilo de viaje</p>
          <span className="text-[11px] text-slate-500">Guardado en tu perfil</span>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {[
            ["👥", profile.tripType[0].toUpperCase() + profile.tripType.slice(1)],
            ["🎒", "Aventura"],
            ...(profile.accessibility ? [["♿", "Accesible"]] : []),
            ["🌿", "Naturaleza"],
            ["🪘", "Cultura"],
          ].map(([emoji, label]) => (
            <span
              key={label}
              className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-[11.5px] font-semibold text-slate-700 ring-1 ring-amber-200"
            >
              <span>{emoji}</span>
              {label}
            </span>
          ))}
        </div>
      </div>

      <button
        onClick={confirm}
        className="w-full rounded-full bg-slate-900 py-3.5 text-[14px] font-semibold text-white shadow-[0_12px_24px_-12px_rgba(15,23,42,0.5)]"
      >
        ¡Ayúdame! Recomiéndame ahora →
      </button>
    </div>
  );
}

function budgetToAmount(b: "bajo" | "medio" | "alto"): string {
  switch (b) {
    case "bajo":
      return "650";
    case "medio":
      return "1.250";
    case "alto":
      return "2.800";
  }
}
