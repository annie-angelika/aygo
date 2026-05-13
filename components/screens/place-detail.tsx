"use client";

import { useRouter } from "next/navigation";
import type { Destination } from "@/types";

import { SaveButton } from "@/components/ui/save-button";
import { PrimaryCta } from "@/components/ui/primary-cta";
import { ReviewRow, Stars } from "@/components/ui/primitives";
import { waLink } from "@/lib/whatsapp";

export function PlaceDetail({ destination: d }: { destination: Destination }) {
  return (
    <div className="fixed inset-0 z-[60] flex flex-col bg-white">
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-md">
          <PlaceHero destination={d} />
          <PlaceContent destination={d} />
        </div>
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-5 z-10 flex justify-center px-5">
        <div className="pointer-events-auto w-full max-w-md">
          <PrimaryCta
            href={waLink(
              d.guide.phone,
              `Hola ${d.guide.name}, te encontré en Aygo. Me interesa ${d.name}.`,
            )}
            external
          >
            Contactar a {d.guide.name} →
          </PrimaryCta>
        </div>
      </div>
    </div>
  );
}

function PlaceHero({ destination: d }: { destination: Destination }) {
  const router = useRouter();
  return (
    <div className="relative h-[420px] w-full">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={d.hero} alt={d.name} className="h-full w-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-black/30" />

      <div className="absolute inset-x-5 top-6 flex items-center justify-between text-white">
        <button
          type="button"
          onClick={() => router.back()}
          aria-label="Volver"
          className="grid size-10 place-items-center rounded-full bg-white/20 backdrop-blur"
        >
          ‹
        </button>
        <p className="text-[14px] font-semibold">Vista del lugar</p>
        <SaveButton destinationId={d.id} size="md" variant="glass" />
      </div>

      <div className="absolute inset-x-5 bottom-6 text-white">
        <p className="text-[11.5px] font-medium uppercase tracking-wider text-white/85">
          {d.region} · {d.vibe}
        </p>
        <p className="text-[34px] font-semibold leading-[1.05] tracking-tight">
          {d.name}
        </p>
        <p className="mt-1 max-w-[260px] text-[12.5px] leading-snug text-white/85">
          “{d.tagline}. Ideal para tu perfil según presupuesto y fechas.” — guía a cargo: {d.guide.name}
        </p>
      </div>
    </div>
  );
}

function PlaceContent({ destination: d }: { destination: Destination }) {
  return (
    <div className="-mt-6 rounded-t-3xl bg-white px-5 pt-5 pb-32">
      <p className="text-[12.5px] font-semibold uppercase tracking-wider text-slate-500">
        Reseñas
      </p>
      <div className="mt-2 flex items-end gap-3">
        <p className="text-[44px] font-semibold leading-none text-slate-900">
          {d.rating}
        </p>
        <div className="pb-1">
          <Stars value={d.rating} />
          <p className="text-[11px] text-slate-500">
            {d.reviews.toLocaleString("es-BO")} reseñas
          </p>
        </div>
      </div>

      <div className="mt-5 flex flex-col gap-3">
        <ReviewRow
          avatar="rev1"
          name="Lucía P."
          text="Fuimos en pareja con presupuesto medio. El guía coordinó todo por WhatsApp, súper claro."
        />
        <ReviewRow
          avatar="rev2"
          name="Mateo R."
          text="Recomendaciones a la medida. Llegamos a un mirador que no aparece en Google."
        />
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3 text-center">
        <FactCell label="Desde" value={`Bs ${d.priceFrom}`} />
        <FactCell label="Accesibilidad" value={d.accessible ? "Sí" : "Parcial"} />
      </div>
    </div>
  );
}

function FactCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-3">
      <p className="text-[11px] text-slate-500">{label}</p>
      <p className="text-[18px] font-semibold text-slate-900">{value}</p>
    </div>
  );
}
