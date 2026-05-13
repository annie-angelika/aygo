"use client";

import Link from "next/link";
import { useState } from "react";
import { useDestinations } from "@/hooks/use-destinations";
import { useProfile } from "@/hooks/use-profile";
import { useTrips } from "@/hooks/use-trips";
import type { Destination, Trip } from "@/types";

import { DetailHeader } from "@/components/ui/detail-header";
import { PrimaryCta } from "@/components/ui/primary-cta";
import { Skeleton } from "@/components/ui/skeleton";
import { PinIcon } from "@/components/ui/icons";
import { DatePickerWeek } from "@/components/plan/date-picker-week";
import { BudgetSelector } from "@/components/plan/budget-selector";
import { TripStyleTags } from "@/components/plan/trip-style-tags";

const BUDGET_TO_AMOUNT: Record<Trip["budget"], string> = {
  bajo: "650",
  medio: "1.250",
  alto: "2.800",
};

export function PlanScreen() {
  const { data: destinations, loading } = useDestinations();
  const { profile, patch } = useProfile();
  const { upsert } = useTrips();

  // The first destination is the active selection in the mockup. Replace
  // with `useSelectedDestination()` once a picker exists.
  const dest = destinations[0];

  const [selectedDay, setSelectedDay] = useState(2);
  const [pickedDate, setPickedDate] = useState<Date | null>(null);

  const confirm = () => {
    if (!dest) return;
    const date = (pickedDate ?? new Date()).toISOString().slice(0, 10);
    upsert({
      id: `trip-${Date.now()}`,
      destinationId: dest.id,
      startDate: date,
      endDate: date,
      budget: profile.budget,
      status: "draft",
      createdAt: new Date().toISOString(),
    });
    patch({ startDate: date });
  };

  return (
    <div className="flex flex-col gap-5 px-5 pt-3">
      <DetailHeader title="Planificar viaje" />

      {loading || !dest ? (
        <Skeleton className="h-[120px]" />
      ) : (
        <DestinationHero destination={dest} />
      )}

      <section className="rounded-3xl bg-white/80 p-4 ring-1 ring-white backdrop-blur">
        <div className="flex items-center justify-between">
          <p className="text-[15px] font-semibold text-slate-900">
            Fechas y presupuesto
          </p>
          <button
            type="button"
            onClick={confirm}
            className="text-[12.5px] font-semibold text-blue-500"
          >
            Guardar
          </button>
        </div>

        <DatePickerWeek
          className="mt-3"
          selectedIndex={selectedDay}
          onSelect={(i, date) => {
            setSelectedDay(i);
            setPickedDate(date);
          }}
        />

        <BudgetSelector
          className="mt-5"
          value={profile.budget}
          onChange={(next) => patch({ budget: next })}
          amount={`Bs ${BUDGET_TO_AMOUNT[profile.budget]}`}
        />
      </section>

      <section className="rounded-3xl bg-white/80 p-4 ring-1 ring-white backdrop-blur">
        <div className="flex items-center justify-between">
          <p className="text-[15px] font-semibold text-slate-900">
            Estilo de viaje
          </p>
          <span className="text-[11px] text-slate-500">
            Guardado en tu perfil
          </span>
        </div>
        <TripStyleTags className="mt-3" profile={profile} />
      </section>

      <PrimaryCta onClick={confirm}>
        ¡Ayúdame! Recomiéndame ahora →
      </PrimaryCta>
    </div>
  );
}

/** Inline because it's the only banner using a "Cambiar" badge + left-aligned text. */
function DestinationHero({ destination: d }: { destination: Destination }) {
  return (
    <Link
      href={`/place/${d.id}`}
      className="relative block h-[120px] w-full overflow-hidden rounded-3xl text-left ring-1 ring-white/60"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={d.hero} alt={d.name} className="h-full w-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/55 via-black/15 to-transparent" />
      <div className="absolute inset-y-0 left-4 flex flex-col justify-center text-white">
        <span className="inline-flex items-center gap-1.5 text-[11px]">
          <PinIcon /> Destino
        </span>
        <p className="mt-1 text-[18px] font-semibold leading-tight">
          {d.name}, {d.region}
        </p>
      </div>
      <span className="absolute right-3 top-3 rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-semibold text-slate-900">
        Cambiar
      </span>
    </Link>
  );
}
