"use client";

import { useState } from "react";
import { LuCalendarDays } from "react-icons/lu";
import type { Event } from "@/types";
import { cn } from "@/lib/utils";
import { EventRow } from "@/components/cards/event-row";

type Day = { key: string; top: string; num: string; isToday: boolean };

// Events carry their date as a display string ("Sáb 14 Feb · 10:00" | "Hoy ·
// 10:30"); pull out the weekday + day number for the calendar strip.
function parseDay(ev: Event): Day {
  const datePart = ev.date.split("·")[0]?.trim() ?? "";
  const tokens = datePart.split(/\s+/);
  if (tokens[0]?.toLowerCase() === "hoy") {
    return { key: "hoy", top: "HOY", num: String(new Date().getDate()), isToday: true };
  }
  const [weekday = "", day = ""] = tokens;
  return { key: datePart, top: weekday.toUpperCase(), num: day, isToday: false };
}

/**
 * Calendar-style agenda for the home "Eventos" section: a horizontal day strip
 * (today first) that filters the list below, so people scan which days have
 * what rather than reading one date per row.
 */
export function EventsCalendar({ events }: { events: Event[] }) {
  const withDay = events.map((e) => ({ ev: e, day: parseDay(e) }));
  // Today first, then in source order; one strip cell per distinct day.
  const ordered = [...withDay].sort(
    (a, b) => Number(b.day.isToday) - Number(a.day.isToday),
  );
  const days: Day[] = [];
  const seen = new Set<string>();
  for (const w of ordered) {
    if (!seen.has(w.day.key)) {
      seen.add(w.day.key);
      days.push(w.day);
    }
  }

  const [selected, setSelected] = useState<string>("all");
  const shown = (
    selected === "all"
      ? ordered
      : ordered.filter((w) => w.day.key === selected)
  ).map((w) => w.ev);

  const cell =
    "flex h-[60px] w-[54px] shrink-0 flex-col items-center justify-center rounded-2xl ring-1 transition active:scale-95";
  const activeCell =
    "bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white ring-transparent shadow-[0_10px_22px_-8px_rgba(217,70,239,0.7)]";
  const idleCell = "bg-white/[0.05] text-violet-100 ring-white/[0.12]";

  return (
    <div className="flex flex-col gap-3.5">
      <div className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <button
          onClick={() => setSelected("all")}
          className={cn(cell, "gap-1", selected === "all" ? activeCell : idleCell)}
        >
          <LuCalendarDays className="size-4" aria-hidden />
          <span className="text-[9.5px] font-semibold">Todos</span>
        </button>

        {days.map((d) => {
          const active = selected === d.key;
          return (
            <button
              key={d.key}
              onClick={() => setSelected(d.key)}
              className={cn(cell, "gap-0.5", active ? activeCell : idleCell)}
            >
              <span
                className={cn(
                  "text-[9.5px] font-semibold uppercase tracking-wide",
                  active ? "text-white/85" : "text-fuchsia-300",
                )}
              >
                {d.top}
              </span>
              <span className="text-[18px] font-bold leading-none">{d.num}</span>
              <span
                className={cn(
                  "size-1 rounded-full",
                  active ? "bg-white" : "bg-fuchsia-400",
                )}
              />
            </button>
          );
        })}
      </div>

      <div className="flex flex-col gap-2.5">
        {shown.map((e) => (
          <EventRow key={e.id} event={e} tone="dark" />
        ))}
      </div>
    </div>
  );
}
