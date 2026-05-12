"use client";

import { useState } from "react";
import {
  aiInsights,
  destinations,
  events,
  guides,
  type Destination,
} from "../_lib/mock-data";

type Tab = "home" | "vibes" | "plan" | "journal" | "profile";

export default function AppMockup() {
  const [tab, setTab] = useState<Tab>("home");
  const [detail, setDetail] = useState<Destination | null>(null);

  return (
    <>
      <Screen tab={tab}>
        {tab === "home" && <HomeScreen onOpen={setDetail} />}
        {tab === "vibes" && <VibesScreen onOpen={setDetail} />}
        {tab === "plan" && <PlanScreen onOpen={setDetail} />}
        {tab === "journal" && <JournalScreen onOpen={setDetail} />}
        {tab === "profile" && <ProfileScreen />}
      </Screen>
      <TabBar tab={tab} onChange={setTab} />
      {detail && (
        <PlaceDetailOverlay
          destination={detail}
          onClose={() => setDetail(null)}
        />
      )}
    </>
  );
}

/* -------------------------------------------------------------------------- */
/*  Shell                                                                     */
/* -------------------------------------------------------------------------- */

function Screen({ tab, children }: { tab: Tab; children: React.ReactNode }) {
  // Each tab gets a subtly distinct ambient gradient, matching the reference vibes.
  const bg: Record<Tab, string> = {
    home: "bg-[linear-gradient(180deg,#fde7c2_0%,#fef9ef_22%,#e7f0ff_70%,#cfe1ff_100%)]",
    vibes: "bg-[linear-gradient(180deg,#fde7c2_0%,#fff5e3_30%,#dff1ff_75%,#c5dfff_100%)]",
    plan: "bg-[linear-gradient(180deg,#fde7c2_0%,#fff3da_25%,#d8e8ff_70%,#bcd4ff_100%)]",
    journal: "bg-[linear-gradient(180deg,#fde7c2_0%,#faeede_25%,#dde9f7_70%,#c4d6ee_100%)]",
    profile: "bg-[linear-gradient(180deg,#fde7c2_0%,#fff7e6_25%,#e5f0fb_70%,#d2e1f6_100%)]",
  };
  return (
    <main className={`min-h-svh w-full ${bg[tab]}`}>
      <div className="mx-auto w-full max-w-md pt-6 pb-[120px]">{children}</div>
    </main>
  );
}

/* -------------------------------------------------------------------------- */
/*  Tab bar                                                                   */
/* -------------------------------------------------------------------------- */

function TabBar({ tab, onChange }: { tab: Tab; onChange: (t: Tab) => void }) {
  const items: { id: Tab; icon: (active: boolean) => React.ReactNode; label: string }[] = [
    { id: "home", label: "Inicio", icon: (a) => <HomeIcon active={a} /> },
    { id: "vibes", label: "Vibes", icon: (a) => <GridIcon active={a} /> },
    { id: "plan", label: "Plan", icon: (a) => <CalendarIcon active={a} /> },
    { id: "journal", label: "Diario", icon: (a) => <BookmarkIcon active={a} /> },
    { id: "profile", label: "Perfil", icon: (a) => <UserIcon active={a} /> },
  ];
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-5 z-40 flex justify-center px-6">
      <div className="pointer-events-auto flex items-center gap-1 rounded-full border border-white/60 bg-white/70 px-2 py-2 shadow-[0_12px_30px_-12px_rgba(15,23,42,0.35)] backdrop-blur-xl">
        {items.map((it) => {
          const active = tab === it.id;
          return (
            <button
              key={it.id}
              onClick={() => onChange(it.id)}
              aria-label={it.label}
              className={`flex size-11 items-center justify-center rounded-full transition-colors ${
                active ? "bg-slate-900 text-white" : "text-slate-500 hover:text-slate-900"
              }`}
            >
              {it.icon(active)}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Screens                                                                   */
/* -------------------------------------------------------------------------- */

function HomeScreen({ onOpen }: { onOpen: (d: Destination) => void }) {
  const featured = destinations.slice(0, 4);
  const eventsList = events.slice(0, 3);
  return (
    <div className="flex flex-col gap-5 px-5 pt-3">
      <header>
        <p className="text-[15px] font-medium text-slate-600">Listo para Explorar</p>
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
          ¡Bolivia! <span className="text-amber-500">🇧🇴</span>
        </h1>
      </header>

      <SearchBar
        placeholder="Busca lugares, eventos, guías…"
        onSelectDestination={onOpen}
      />

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
              <p className="text-[10.5px] font-medium text-slate-500">{it.target}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Sugerencias locales" subtitle="Curado por IA" action="Ver todo">
        <div className="-mx-5 flex gap-3 overflow-x-auto px-5 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {featured.map((d) => (
            <button
              key={d.id}
              onClick={() => onOpen(d)}
              className="relative w-[180px] shrink-0 overflow-hidden rounded-3xl text-left ring-1 ring-white/60 shadow-[0_8px_24px_-12px_rgba(15,23,42,0.25)]"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={d.img}
                alt={d.name}
                className="h-[230px] w-full object-cover"
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent p-3 pt-10 text-white">
                <p className="text-[10px] font-medium uppercase tracking-wider text-white/80">
                  {d.region}
                </p>
                <p className="mt-0.5 text-[15px] font-semibold leading-tight">{d.name}</p>
                <p className="mt-0.5 text-[11px] text-white/80">{d.tagline}</p>
              </div>
              <span className="absolute right-2.5 top-2.5 rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-semibold text-slate-900">
                ★ {d.rating}
              </span>
            </button>
          ))}
        </div>
      </Section>

      <Section title="Eventos cerca" action="Ver todo">
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
      </Section>
    </div>
  );
}

function VibesScreen({ onOpen }: { onOpen: (d: Destination) => void }) {
  const filters = ["Imperdibles", "Joyas escondidas", "Naturaleza", "Cultura", "Comida"];
  const [active, setActive] = useState(0);
  const visible = destinations.filter((d) => {
    if (active === 0) return true;
    if (active === 1) return d.reviews < 300;
    if (active === 2) return d.vibe === "Naturaleza";
    if (active === 3) return d.vibe === "Cultura";
    if (active === 4) return d.vibe === "Gastronomía";
    return true;
  });
  const hero = destinations[0];
  const grid = visible.slice(0, 4);
  return (
    <div className="flex flex-col gap-5 px-5 pt-3">
      <header>
        <p className="text-[15px] font-medium text-slate-600">Explora nuevos</p>
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900">Vibes</h1>
      </header>

      <SearchBar
        placeholder="Busca por vibe, lugar, etiqueta…"
        onSelectDestination={onOpen}
      />

      <div className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {filters.map((f, i) => (
          <button
            key={f}
            onClick={() => setActive(i)}
            className={`shrink-0 rounded-full px-4 py-1.5 text-[12.5px] font-semibold transition-colors ${
              active === i
                ? "bg-amber-300 text-slate-900"
                : "bg-white/70 text-slate-700 ring-1 ring-white"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      <button
        onClick={() => onOpen(hero)}
        className="relative h-[150px] w-full overflow-hidden rounded-3xl text-left ring-1 ring-white/60"
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
      </button>

      <Section title="Imperdibles de hoy" subtitle="Ruta sugerida por IA" action="Ver todo">
        <div className="grid grid-cols-2 gap-3">
          {grid.map((d) => (
            <button
              key={d.id}
              onClick={() => onOpen(d)}
              className="relative h-[180px] w-full overflow-hidden rounded-3xl text-left ring-1 ring-white/60 shadow-[0_8px_24px_-12px_rgba(15,23,42,0.25)]"
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
              <span
                aria-hidden
                className="absolute right-2.5 top-2.5 grid size-7 place-items-center rounded-full bg-white/90 text-slate-900"
              >
                <HeartIcon />
              </span>
            </button>
          ))}
        </div>
      </Section>

      <Section title="Joyas escondidas cerca">
        <div className="flex flex-col gap-2.5">
          {destinations.slice(4, 7).map((d) => (
            <button
              key={d.id}
              onClick={() => onOpen(d)}
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
            </button>
          ))}
        </div>
      </Section>
    </div>
  );
}

function PlanScreen({ onOpen }: { onOpen: (d: Destination) => void }) {
  const dest = destinations[0]; // Uyuni as the active selection
  const days = ["L", "M", "M", "J", "V", "S", "D"];
  const dates = [12, 13, 14, 15, 16, 17, 18];
  const [selected, setSelected] = useState(2);
  return (
    <div className="flex flex-col gap-5 px-5 pt-3">
      <header className="flex items-center justify-between">
        <BackButton />
        <h1 className="text-[15px] font-semibold text-slate-900">Planificar viaje</h1>
        <MoreButton />
      </header>

      <button
        onClick={() => onOpen(dest)}
        className="relative h-[120px] w-full overflow-hidden rounded-3xl text-left ring-1 ring-white/60"
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
      </button>

      <div className="rounded-3xl bg-white/80 p-4 ring-1 ring-white backdrop-blur">
        <div className="flex items-center justify-between">
          <p className="text-[15px] font-semibold text-slate-900">Fechas y presupuesto</p>
          <button className="text-[12.5px] font-semibold text-blue-500">Guardar</button>
        </div>
        <div className="mt-3 grid grid-cols-7 gap-1.5 text-center">
          {days.map((d, i) => (
            <p key={i} className="text-[10.5px] font-semibold uppercase text-slate-500">
              {d}
            </p>
          ))}
          {dates.map((n, i) => {
            const active = selected === i;
            return (
              <button
                key={n}
                onClick={() => setSelected(i)}
                className={`mx-auto grid size-9 place-items-center rounded-full text-[13px] font-semibold transition-colors ${
                  active
                    ? "bg-blue-500 text-white"
                    : "bg-blue-50 text-slate-700 hover:bg-blue-100"
                }`}
              >
                {n}
              </button>
            );
          })}
        </div>

        <div className="mt-5">
          <p className="text-[12.5px] font-semibold uppercase tracking-wider text-slate-500">
            Presupuesto
          </p>
          <div className="mt-2 flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
            <span className="text-[20px] font-semibold text-slate-900">Bs 1.250</span>
            <span className="text-[11px] text-slate-500">por persona</span>
          </div>
          <div className="mt-3 flex gap-2">
            {["Bajo", "Medio", "Alto"].map((tier, i) => (
              <button
                key={tier}
                className={`flex-1 rounded-full py-1.5 text-[12px] font-semibold ${
                  i === 1
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
          <span className="text-[11px] text-slate-500">Editable</span>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {[
            ["👥", "Pareja"],
            ["🎒", "Aventura"],
            ["♿", "Accesible"],
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

      <button className="w-full rounded-full bg-slate-900 py-3.5 text-[14px] font-semibold text-white shadow-[0_12px_24px_-12px_rgba(15,23,42,0.5)]">
        ¡Ayúdame! Recomiéndame ahora →
      </button>
    </div>
  );
}

function JournalScreen({ onOpen }: { onOpen: (d: Destination) => void }) {
  const [view, setView] = useState<"timeline" | "story">("timeline");
  const trips = [
    { d: destinations[1], when: "Hace 2 semanas", tags: ["Aventura", "Pareja"] },
    { d: destinations[4], when: "Mar · 3 días", tags: ["Naturaleza", "Selva"] },
    { d: destinations[5], when: "Ene", tags: ["Cultura", "Familia"] },
  ];
  return (
    <div className="flex flex-col gap-5 px-5 pt-3">
      <header>
        <p className="text-[15px] font-medium text-slate-600">Tu diario de viajes</p>
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900">Aygo Journal</h1>
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

      <div className="flex flex-col gap-3">
        {trips.map(({ d, when, tags }) => (
          <button
            key={d.id}
            onClick={() => onOpen(d)}
            className="relative h-[160px] w-full overflow-hidden rounded-3xl text-left ring-1 ring-white/60 shadow-[0_8px_24px_-14px_rgba(15,23,42,0.3)]"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={d.hero} alt={d.name} className="h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/15 to-transparent" />
            <div className="absolute right-2.5 top-2.5 flex flex-col gap-1.5">
              <span className="grid size-8 place-items-center rounded-full bg-white/85 text-[10.5px] font-semibold text-slate-900">
                +{Math.floor(d.reviews / 100)}
              </span>
              <span className="grid size-8 place-items-center rounded-full bg-white/85 text-[10.5px] font-semibold text-rose-500">
                ♥
              </span>
            </div>
            <div className="absolute inset-x-3 bottom-3 text-white">
              <p className="text-[10.5px] font-medium uppercase tracking-wider text-white/80">
                {d.region} · {when}
              </p>
              <p className="text-[18px] font-semibold leading-tight">{d.name}</p>
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {tags.map((t) => (
                  <span
                    key={t}
                    className="rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-semibold backdrop-blur"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

function ProfileScreen() {
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
          <p className="text-[18px] font-semibold text-slate-900">A. Álvarez</p>
          <span className="text-[12px] text-slate-500">(Aygonauta)</span>
        </div>
        <p className="flex items-center gap-1 text-[12px] text-slate-500">
          <PinIcon /> A 8 km de Santa Cruz de la Sierra
        </p>
        <div className="mt-1 flex gap-1.5">
          <span className="rounded-full bg-amber-300 px-3 py-0.5 text-[11px] font-semibold text-slate-900">
            Nómada
          </span>
          <span className="rounded-full bg-white/80 px-3 py-0.5 text-[11px] font-semibold text-slate-700 ring-1 ring-white">
            Explorador
          </span>
        </div>
      </div>

      <div className="grid grid-cols-3 divide-x divide-slate-200/70 rounded-3xl bg-white/80 py-3 text-center ring-1 ring-white backdrop-blur">
        <Stat n="3" label="Regiones" />
        <Stat n="14" label="Lugares" />
        <Stat n="22" label="Reseñas" />
      </div>

      <div>
        <p className="px-1 text-[12.5px] font-semibold uppercase tracking-wider text-slate-500">
          Tu perfil de viaje
        </p>
        <div className="mt-2 flex flex-col gap-2">
          <ProfileRow emoji="🧭" title="Gestor de persona" sub="Editar preferencias y formulario inicial" />
          <ProfileRow emoji="🏷️" title="Lugares guardados" sub={`${destinations.length} destinos en tu lista`} />
          <ProfileRow emoji="🗺️" title="Viajes guardados" sub="2 borradores · 1 confirmado" />
        </div>
      </div>

      <div>
        <p className="px-1 text-[12.5px] font-semibold uppercase tracking-wider text-slate-500">
          Tus guías favoritos
        </p>
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
              <button className="rounded-full bg-emerald-500 px-3 py-1 text-[11px] font-semibold text-white">
                WhatsApp
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Overlay: place detail                                                     */
/* -------------------------------------------------------------------------- */

function PlaceDetailOverlay({
  destination,
  onClose,
}: {
  destination: Destination;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[60] flex flex-col bg-white">
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-md">
          <div className="relative h-[420px] w-full">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={destination.hero}
              alt={destination.name}
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-black/30" />
            <div className="absolute inset-x-5 top-6 flex items-center justify-between text-white">
              <button
                onClick={onClose}
                aria-label="Volver"
                className="grid size-10 place-items-center rounded-full bg-white/20 backdrop-blur"
              >
                ‹
              </button>
              <p className="text-[14px] font-semibold">Vista del lugar</p>
              <button
                aria-label="Más"
                className="grid size-10 place-items-center rounded-full bg-white/20 backdrop-blur"
              >
                ⋯
              </button>
            </div>
            <div className="absolute inset-x-5 bottom-6 text-white">
              <p className="text-[11.5px] font-medium uppercase tracking-wider text-white/85">
                {destination.region} · {destination.vibe}
              </p>
              <p className="text-[34px] font-semibold leading-[1.05] tracking-tight">
                {destination.name}
              </p>
              <p className="mt-1 max-w-[260px] text-[12.5px] leading-snug text-white/85">
                “{destination.tagline}. Ideal para tu perfil según presupuesto y fechas.”
                — guía a cargo: {destination.guide.name}
              </p>
            </div>
          </div>

          <div className="-mt-6 rounded-t-3xl bg-white px-5 pt-5 pb-32">
            <p className="text-[12.5px] font-semibold uppercase tracking-wider text-slate-500">
              Reseñas
            </p>
            <div className="mt-2 flex items-end gap-3">
              <p className="text-[44px] font-semibold leading-none text-slate-900">
                {destination.rating}
              </p>
              <div className="pb-1">
                <Stars value={destination.rating} />
                <p className="text-[11px] text-slate-500">
                  {destination.reviews.toLocaleString("es-BO")} reseñas
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
                  Bs {destination.priceFrom}
                </p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-3">
                <p className="text-[11px] text-slate-500">Accesibilidad</p>
                <p className="text-[18px] font-semibold text-slate-900">
                  {destination.accessible ? "Sí" : "Parcial"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-5 z-10 flex justify-center px-5">
        <div className="pointer-events-auto w-full max-w-md">
          <button className="flex w-full items-center justify-center gap-2 rounded-full bg-slate-900 py-3.5 text-[14px] font-semibold text-white shadow-[0_12px_30px_-12px_rgba(15,23,42,0.5)]">
            Contactar a {destination.guide.name} →
          </button>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Small bits                                                                */
/* -------------------------------------------------------------------------- */

function Section({
  title,
  subtitle,
  action,
  children,
}: {
  title: string;
  subtitle?: string;
  action?: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <div className="mb-2.5 flex items-end justify-between px-0.5">
        <div>
          {subtitle && (
            <p className="text-[10.5px] font-semibold uppercase tracking-wider text-amber-600">
              {subtitle}
            </p>
          )}
          <h2 className="text-[16px] font-semibold tracking-tight text-slate-900">
            {title}
          </h2>
        </div>
        {action && (
          <button className="text-[12px] font-semibold text-slate-500">{action}</button>
        )}
      </div>
      {children}
    </section>
  );
}

const QUICK_SUGGESTIONS = ["Uyuni", "La Paz", "Naturaleza", "Carnaval", "Santa Cruz"];

function SearchBar({
  placeholder,
  onSelectDestination,
}: {
  placeholder: string;
  onSelectDestination?: (d: Destination) => void;
}) {
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);

  const q = query.trim().toLowerCase();
  const matches = (h: string) => h.toLowerCase().includes(q);

  const matchedDestinations = q
    ? destinations
        .filter(
          (d) =>
            matches(d.name) ||
            matches(d.region) ||
            matches(d.vibe) ||
            matches(d.tagline),
        )
        .slice(0, 4)
    : [];
  const matchedEvents = q
    ? events
        .filter(
          (e) => matches(e.name) || matches(e.region) || matches(e.vibe),
        )
        .slice(0, 3)
    : [];
  const matchedGuides = q
    ? guides
        .filter(
          (g) => matches(g.name) || matches(g.city) || matches(g.focus),
        )
        .slice(0, 3)
    : [];
  const hasResults =
    matchedDestinations.length + matchedEvents.length + matchedGuides.length >
    0;
  const showPanel = focused;
  const showResults = q.length > 0;

  const pickDestination = (d: Destination) => {
    setQuery("");
    setFocused(false);
    onSelectDestination?.(d);
  };

  return (
    <div className="relative">
      <div className="flex items-center gap-2 rounded-2xl bg-white/80 px-3.5 py-3 ring-1 ring-white shadow-[0_1px_0_rgba(0,0,0,0.04)] backdrop-blur focus-within:ring-amber-300">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400">
          <circle cx="11" cy="11" r="7" />
          <path d="m21 21-4.3-4.3" />
        </svg>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setFocused(true)}
          // Delay blur so clicks on dropdown items register before the panel closes.
          onBlur={() => setTimeout(() => setFocused(false), 120)}
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              setQuery("");
              (e.target as HTMLInputElement).blur();
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
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="9" y="3" width="6" height="12" rx="3" />
              <path d="M5 11a7 7 0 0 0 14 0" />
              <path d="M12 18v3" />
            </svg>
          </span>
        )}
      </div>

      {showPanel && (
        <div
          // Prevent the blur from firing before the click on a result registers.
          onMouseDown={(e) => e.preventDefault()}
          className="absolute inset-x-0 top-[calc(100%+8px)] z-30 max-h-[60vh] overflow-y-auto rounded-2xl bg-white/95 p-2 shadow-[0_18px_40px_-18px_rgba(15,23,42,0.35)] ring-1 ring-slate-200/70 backdrop-blur"
        >
          {!showResults && (
            <div className="px-2 py-2">
              <p className="text-[10.5px] font-semibold uppercase tracking-wider text-slate-500">
                Pruebas rápidas
              </p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {QUICK_SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => setQuery(s)}
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
          )}

          {showResults && !hasResults && (
            <p className="px-3 py-4 text-[12.5px] text-slate-500">
              Sin coincidencias para{" "}
              <span className="font-semibold text-slate-700">“{query}”</span>.
              Probá con “Uyuni”, “Carnaval” o “Santa Cruz”.
            </p>
          )}

          {matchedDestinations.length > 0 && (
            <ResultGroup title={`Destinos · ${matchedDestinations.length}`}>
              {matchedDestinations.map((d) => (
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

          {matchedEvents.length > 0 && (
            <ResultGroup title={`Eventos · ${matchedEvents.length}`}>
              {matchedEvents.map((ev) => (
                <button
                  key={ev.id}
                  onClick={() => {
                    setQuery("");
                    setFocused(false);
                  }}
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
              ))}
            </ResultGroup>
          )}

          {matchedGuides.length > 0 && (
            <ResultGroup title={`Guías · ${matchedGuides.length}`}>
              {matchedGuides.map((g) => (
                <button
                  key={g.id}
                  onClick={() => {
                    setQuery("");
                    setFocused(false);
                  }}
                  className="flex w-full items-center gap-3 rounded-xl p-2 text-left hover:bg-amber-50"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={g.avatar}
                    alt=""
                    className="size-10 shrink-0 rounded-full object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] font-semibold text-slate-900">
                      {g.name}{" "}
                      <span className="text-slate-400">· {g.city}</span>
                    </p>
                    <p className="truncate text-[11.5px] text-slate-500">
                      {g.focus} · {g.trips} viajes
                    </p>
                  </div>
                  <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10.5px] font-semibold text-emerald-700">
                    ★ {g.rating}
                  </span>
                </button>
              ))}
            </ResultGroup>
          )}
        </div>
      )}
    </div>
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

function Stat({ n, label }: { n: string; label: string }) {
  return (
    <div className="px-3">
      <p className="text-[20px] font-semibold text-slate-900">{n}</p>
      <p className="text-[11px] text-slate-500">{label}</p>
    </div>
  );
}

function ProfileRow({ emoji, title, sub }: { emoji: string; title: string; sub: string }) {
  return (
    <button className="flex items-center gap-3 rounded-2xl bg-white/80 p-3 text-left ring-1 ring-white backdrop-blur">
      <span className="grid size-10 place-items-center rounded-xl bg-amber-50 text-lg">
        {emoji}
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[13.5px] font-semibold text-slate-900">{title}</p>
        <p className="truncate text-[11.5px] text-slate-500">{sub}</p>
      </div>
      <span className="text-slate-400">›</span>
    </button>
  );
}

function Stars({ value }: { value: number }) {
  const full = Math.floor(value);
  return (
    <p className="text-[15px] text-amber-400">
      {"★".repeat(full)}
      <span className="text-slate-200">{"★".repeat(5 - full)}</span>
    </p>
  );
}

function ReviewRow({
  avatar,
  name,
  text,
}: {
  avatar: string;
  name: string;
  text: string;
}) {
  return (
    <div className="flex items-start gap-3 rounded-2xl bg-slate-50 p-3">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`https://picsum.photos/seed/${avatar}/100/100`}
        alt={name}
        className="size-9 shrink-0 rounded-full object-cover"
      />
      <div className="min-w-0 flex-1">
        <p className="text-[13px] font-semibold text-slate-900">{name}</p>
        <p className="text-[12px] leading-snug text-slate-600">{text}</p>
      </div>
    </div>
  );
}

function BackButton() {
  return (
    <button
      aria-label="Volver"
      className="grid size-9 place-items-center rounded-full bg-white/70 text-slate-700 ring-1 ring-white backdrop-blur"
    >
      ‹
    </button>
  );
}
function MoreButton() {
  return (
    <button
      aria-label="Más"
      className="grid size-9 place-items-center rounded-full bg-white/70 text-slate-700 ring-1 ring-white backdrop-blur"
    >
      ⋯
    </button>
  );
}

function PinIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M12 21s-7-6.2-7-11a7 7 0 1 1 14 0c0 4.8-7 11-7 11z" />
      <circle cx="12" cy="10" r="2.5" />
    </svg>
  );
}
function HeartIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}

/* tab icons */
function HomeIcon({ active }: { active: boolean }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M3 11l9-8 9 8" />
      <path d="M5 10v10h14V10" />
    </svg>
  );
}
function GridIcon({ active }: { active: boolean }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
    </svg>
  );
}
function CalendarIcon({ active }: { active: boolean }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="3" y="5" width="18" height="16" rx="2" fill={active ? "currentColor" : "none"} stroke="currentColor" />
      <path d="M3 9h18" stroke={active ? "white" : "currentColor"} />
      <path d="M8 3v4M16 3v4" />
    </svg>
  );
}
function BookmarkIcon({ active }: { active: boolean }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M6 3h12v18l-6-4-6 4V3z" />
    </svg>
  );
}
function UserIcon({ active }: { active: boolean }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21a8 8 0 0 1 16 0" />
    </svg>
  );
}
