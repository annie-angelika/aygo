"use client";

import { useGuides } from "@/hooks/use-guides";
import { useProfile } from "@/hooks/use-profile";
import { useSavedPlaces } from "@/hooks/use-saved-places";
import { useTrips } from "@/hooks/use-trips";
import { waLink } from "@/lib/whatsapp";
import { PinIcon } from "@/components/ui/icons";
import { ProfileRow, Stat } from "@/components/ui/primitives";

export function ProfileScreen() {
  const { profile } = useProfile();
  const { data: guides, loading } = useGuides();
  const { saved } = useSavedPlaces();
  const { trips } = useTrips();

  const drafts = trips.filter((t) => t.status === "draft").length;
  const confirmed = trips.filter((t) => t.status === "confirmed").length;

  return (
    <div className="flex flex-col gap-5 px-5 pt-3">
      <header className="text-center">
        <p className="text-[13px] font-medium text-slate-600">Perfil</p>
      </header>

      <div className="flex flex-col items-center gap-2">
        <div className="relative">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://picsum.photos/seed/aygo-user/240/240"
            alt="Avatar"
            className="size-20 rounded-full object-cover ring-4 ring-white"
          />
          <span className="absolute -right-1 -bottom-1 grid size-7 place-items-center rounded-full bg-white text-[12px] ring-2 ring-amber-200">
            ✦
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <p className="text-[18px] font-semibold text-slate-900">{profile.name}</p>
          <span className="text-[12px] text-slate-500">(Aygonauta)</span>
        </div>
        <p className="flex items-center gap-1 text-[12px] text-slate-500">
          <PinIcon /> {profile.country}
          {profile.country === "Bolivia" ? " · Santa Cruz de la Sierra" : ""}
        </p>
        <div className="mt-1 flex flex-wrap justify-center gap-1.5">
          <span className="rounded-full bg-amber-300 px-3 py-0.5 text-[11px] font-semibold text-slate-900 capitalize">
            {profile.tripType}
          </span>
          {profile.interests.slice(0, 2).map((i) => (
            <span
              key={i}
              className="rounded-full bg-white/80 px-3 py-0.5 text-[11px] font-semibold text-slate-700 ring-1 ring-white"
            >
              {i}
            </span>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-3 divide-x divide-slate-200/70 rounded-3xl bg-white/80 py-3 text-center ring-1 ring-white backdrop-blur">
        <Stat n={String(profile.interests.length)} label="Intereses" />
        <Stat n={String(saved.length)} label="Guardados" />
        <Stat n={String(trips.length)} label="Viajes" />
      </div>

      <div>
        <p className="px-1 text-[12.5px] font-semibold uppercase tracking-wider text-slate-500">
          Tu perfil de viaje
        </p>
        <div className="mt-2 flex flex-col gap-2">
          <ProfileRow
            emoji="🧭"
            title="Gestor de persona"
            sub={`Presupuesto ${profile.budget} · Viaje ${profile.tripType}`}
          />
          <ProfileRow
            emoji="🏷️"
            title="Lugares guardados"
            sub={`${saved.length} ${saved.length === 1 ? "destino" : "destinos"} en tu lista`}
          />
          <ProfileRow
            emoji="🗺️"
            title="Viajes guardados"
            sub={`${drafts} borrador${drafts === 1 ? "" : "es"} · ${confirmed} confirmado${confirmed === 1 ? "" : "s"}`}
          />
        </div>
      </div>

      <div>
        <p className="px-1 text-[12.5px] font-semibold uppercase tracking-wider text-slate-500">
          Tus guías favoritos
        </p>
        {loading ? (
          <div className="mt-2 flex flex-col gap-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-[64px] animate-pulse rounded-2xl bg-white/60" />
            ))}
          </div>
        ) : (
          <div className="mt-2 flex flex-col gap-2">
            {guides.map((g) => (
              <div
                key={g.id}
                className="flex items-center gap-3 rounded-2xl bg-white/80 p-2.5 ring-1 ring-white backdrop-blur"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={g.avatar}
                  alt={g.name}
                  className="size-11 shrink-0 rounded-full object-cover"
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13.5px] font-semibold text-slate-900">
                    {g.name} <span className="text-slate-400">· {g.city}</span>
                  </p>
                  <p className="truncate text-[11.5px] text-slate-500">
                    {g.focus} · {g.trips} viajes
                  </p>
                </div>
                <a
                  href={waLink(g.phone, `Hola ${g.name}, te encontré en Aygo`)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full bg-emerald-500 px-3 py-1 text-[11px] font-semibold text-white"
                >
                  WhatsApp
                </a>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
