"use client";

import { useRouter } from "next/navigation";
import { useSavedPlaces } from "@/hooks/use-saved-places";
import type { Destination } from "@/types";
import { HeartIcon } from "@/components/ui/icons";
import { ReviewRow, Stars } from "@/components/ui/primitives";

export function PlaceDetail({ destination: d }: { destination: Destination }) {
  const router = useRouter();
  const { isSaved, toggle, hydrated } = useSavedPlaces();
  const saved = hydrated && isSaved(d.id);

  return (
    <div className="fixed inset-0 z-[60] flex flex-col bg-white">
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-md">
          <div className="relative h-[420px] w-full">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={d.hero}
              alt={d.name}
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-black/30" />
            <div className="absolute inset-x-5 top-6 flex items-center justify-between text-white">
              <button
                onClick={() => router.back()}
                aria-label="Volver"
                className="grid size-10 place-items-center rounded-full bg-white/20 backdrop-blur"
              >
                ‹
              </button>
              <p className="text-[14px] font-semibold">Vista del lugar</p>
              <button
                onClick={() => toggle(d.id)}
                aria-label={saved ? "Quitar de guardados" : "Guardar"}
                aria-pressed={saved}
                className={`grid size-10 place-items-center rounded-full backdrop-blur transition-colors ${
                  saved ? "bg-rose-500 text-white" : "bg-white/20 text-white"
                }`}
              >
                <HeartIcon filled={saved} />
              </button>
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
              <div className="rounded-2xl bg-slate-50 p-3">
                <p className="text-[11px] text-slate-500">Desde</p>
                <p className="text-[18px] font-semibold text-slate-900">
                  Bs {d.priceFrom}
                </p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-3">
                <p className="text-[11px] text-slate-500">Accesibilidad</p>
                <p className="text-[18px] font-semibold text-slate-900">
                  {d.accessible ? "Sí" : "Parcial"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-5 z-10 flex justify-center px-5">
        <div className="pointer-events-auto w-full max-w-md">
          <a
            href={`https://wa.me/?text=${encodeURIComponent(`Hola ${d.guide.name}, te encontré en Aygo. Me interesa ${d.name}.`)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex w-full items-center justify-center gap-2 rounded-full bg-slate-900 py-3.5 text-[14px] font-semibold text-white shadow-[0_12px_30px_-12px_rgba(15,23,42,0.5)]"
          >
            Contactar a {d.guide.name} →
          </a>
        </div>
      </div>
    </div>
  );
}
