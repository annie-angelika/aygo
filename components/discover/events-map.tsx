"use client";

import { useState } from "react";
import { LuMapPinned } from "react-icons/lu";

import { EmptyState } from "@/components/ui/empty-state";
import { EventPreviewDialog } from "@/components/event/event-preview-dialog";
import { CATEGORY_META } from "@/lib/events-data";
import { cn } from "@/lib/utils";
import type { AygoEvent } from "@/types";

/**
 * Deterministic pin placement: events carry no coordinates, so we hash the id
 * into a stable position inside the map frame (kept off the edges). The same
 * event always lands in the same spot across renders.
 */
function pinPosition(id: string) {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return { left: 8 + (h % 84), top: 16 + ((h >>> 8) % 66) };
}

/**
 * The map view for a city's events: a map backdrop with a clickable pin per
 * event. Tapping a pin opens the quick-preview dialog so you can browse events
 * spatially without leaving the map. Pins are colored by category (CATEGORY_META).
 */
export function EventsMap({
  events,
  city,
  country,
}: {
  events: AygoEvent[];
  city: string;
  country: string;
}) {
  const [selected, setSelected] = useState<AygoEvent | null>(null);
  const place = encodeURIComponent(`${city}, ${country}`);

  if (events.length === 0) {
    return (
      <EmptyState
        icon={LuMapPinned}
        title="Nothing to map yet"
        subtitle="No events match these filters — try a different interest or date."
      />
    );
  }

  return (
    <>
      <div className="relative h-[300px] overflow-hidden rounded-2xl ring-1 ring-border">
        {/* Static map backdrop — pointer-events-none so pins stay clickable and
            the map doesn't hijack the page scroll. */}
        <iframe
          title={`Map of ${city}`}
          src={`https://www.google.com/maps?q=${place}&z=11&output=embed`}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          className="pointer-events-none size-full grayscale-[0.15]"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/5 via-transparent to-black/10" />

        {events.map((event) => {
          const { Icon, accent } = CATEGORY_META[event.category];
          const { left, top } = pinPosition(event.id);
          return (
            <button
              key={event.id}
              type="button"
              onClick={() => setSelected(event)}
              aria-label={`${event.title} — ${event.place}`}
              style={{ left: `${left}%`, top: `${top}%` }}
              className={cn(
                "absolute grid size-9 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-white shadow-[0_6px_16px_-6px_rgba(15,23,42,0.55)] ring-1 ring-black/5 transition-transform",
                "hover:z-10 hover:scale-110 focus-visible:z-10 focus-visible:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              )}
            >
              <Icon className={cn("size-[18px]", accent)} aria-hidden />
            </button>
          );
        })}

        <span className="pointer-events-none absolute bottom-2.5 left-2.5 rounded-full bg-background/90 px-2.5 py-1 text-[11px] font-semibold text-foreground shadow-sm ring-1 ring-border backdrop-blur">
          {events.length} {events.length === 1 ? "event" : "events"}
        </span>
      </div>

      <EventPreviewDialog event={selected} onClose={() => setSelected(null)} />
    </>
  );
}
