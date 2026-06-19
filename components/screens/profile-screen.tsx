"use client";

import { useAccount } from "@/hooks/use-account";
import { useGuides } from "@/hooks/use-guides";
import { useProfile } from "@/hooks/use-profile";
import { useSavedPlaces } from "@/hooks/use-saved-places";
import { useTrips } from "@/hooks/use-trips";
import type { UserProfile } from "@/types";

import { AuthForm } from "@/components/ui/auth-form";
import { PinIcon } from "@/components/ui/icons";
import { ProfileRow, Stat } from "@/components/ui/primitives";
import { SkeletonList } from "@/components/ui/skeleton";
import { GuideRow } from "@/components/cards/guide-row";

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

      <ProfileIdentity profile={profile} />

      <div className="grid grid-cols-3 divide-x divide-slate-200/70 rounded-3xl bg-white/80 py-3 text-center ring-1 ring-white backdrop-blur">
        <Stat n={String(profile.interests.length)} label="Intereses" />
        <Stat n={String(saved.length)} label="Guardados" />
        <Stat n={String(trips.length)} label="Viajes" />
      </div>

      <AccountSection />

      <section>
        <SectionLabel>Tu perfil de viaje</SectionLabel>
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
      </section>

      <section>
        <SectionLabel>Tus guías favoritos</SectionLabel>
        {loading ? (
          <SkeletonList className="mt-2" />
        ) : (
          <div className="mt-2 flex flex-col gap-2">
            {guides.map((g) => (
              <GuideRow key={g.id} guide={g} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

/** Mock account block: register inline, or show who's signed in + sign out. */
function AccountSection() {
  const { account, logout } = useAccount();
  return (
    <section>
      <SectionLabel>Cuenta</SectionLabel>
      {account ? (
        <div className="mt-2 flex items-center justify-between rounded-2xl bg-white/80 p-3 ring-1 ring-white backdrop-blur">
          <div className="min-w-0">
            <p className="truncate text-[14px] font-semibold text-slate-900">
              {account.name}
            </p>
            <p className="truncate text-[12px] text-slate-500">
              {account.email || "Cuenta Aygo"}
            </p>
          </div>
          <button
            type="button"
            onClick={logout}
            className="shrink-0 rounded-full bg-slate-100 px-3 py-1.5 text-[12px] font-semibold text-slate-700 ring-1 ring-slate-200 transition active:scale-95"
          >
            Salir
          </button>
        </div>
      ) : (
        <div className="mt-2 rounded-2xl bg-white/80 p-3 ring-1 ring-white backdrop-blur">
          <p className="mb-2.5 text-[13px] text-slate-600">
            Crea tu cuenta para comentar y guardar tu actividad.
          </p>
          <AuthForm />
        </div>
      )}
    </section>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="px-1 text-[12.5px] font-semibold uppercase tracking-wider text-slate-500">
      {children}
    </p>
  );
}

/** Avatar + name + chips block. Kept local — it's the canonical "you" card. */
function ProfileIdentity({ profile }: { profile: UserProfile }) {
  return (
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
        <p className="text-[18px] font-semibold text-slate-900">
          {profile.name}
        </p>
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
  );
}
