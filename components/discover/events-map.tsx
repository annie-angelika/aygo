"use client";

import { useMemo, useState } from "react";
import { Map, Marker } from "@vis.gl/react-maplibre";
import "maplibre-gl/dist/maplibre-gl.css";
import { LuMapPinned } from "react-icons/lu";

import { EmptyState } from "@/components/ui/empty-state";
import { EventPreviewDialog } from "@/components/event/event-preview-dialog";
import { CATEGORY_META } from "@/lib/events-data";
import { findCityByName, HOME_CENTER } from "@/lib/cities-seed";
import { cn } from "@/lib/utils";
import type { AygoEvent } from "@/types";

// OpenFreeMap: OpenStreetMap vector tiles — free, no API key, no view limits.
// Positron is the muted gray style that matches the app's desaturated look.
const MAP_STYLE = "https://tiles.openfreemap.org/styles/positron";

// Where to center when no event carries coordinates yet: the city's own
// centre from the seed (every city carries one), else the home market.
function cityCenter(city: string): { lng: number; lat: number } {
  const info = findCityByName(city);
  return info?.lat != null && info?.lng != null ? { lng: info.lng, lat: info.lat } : HOME_CENTER;
}

/** Initial camera: fit every pinned event, or fall back to the city center. */
function viewFor(mapped: AygoEvent[], city: string) {
  if (mapped.length === 0) {
    const { lng, lat } = cityCenter(city);
    return { longitude: lng, latitude: lat, zoom: 12 };
  }
  if (mapped.length === 1) {
    return { longitude: mapped[0].lng!, latitude: mapped[0].lat!, zoom: 14 };
  }
  const lngs = mapped.map((e) => e.lng!);
  const lats = mapped.map((e) => e.lat!);
  return {
    bounds: [
      [Math.min(...lngs), Math.min(...lats)],
      [Math.max(...lngs), Math.max(...lats)],
    ] as [[number, number], [number, number]],
    fitBoundsOptions: { padding: 56, maxZoom: 14 },
  };
}

/**
 * The real, interactive map for a set of events (MapLibre GL): pan, pinch and
 * zoom, with a clickable pin per event at its actual coordinates. Tapping a pin
 * opens the quick-preview dialog. Events not geocoded yet simply carry no pin
 * (the count badge shows how many are mapped).
 */
export function EventsMap({
  events,
  city,
  className,
}: {
  events: AygoEvent[];
  /** Fallback map center when no event is geocoded yet. */
  city: string;
  /** Override the map frame (e.g. its height) for tighter layouts. */
  className?: string;
}) {
  const [selected, setSelected] = useState<AygoEvent | null>(null);
  const mapped = events.filter((e) => e.lat != null && e.lng != null);
  // Camera is initial-only by design: refitting on every filter change would
  // yank the map out of the user's hands mid-exploration.
  const initialViewState = useMemo(
    () => viewFor(mapped, city),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

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
      <div
        className={cn(
          "relative h-[300px] overflow-hidden rounded-2xl ring-1 ring-border",
          className,
        )}
      >
        <Map
          initialViewState={initialViewState}
          mapStyle={MAP_STYLE}
          // OSM's license requires attribution; compact collapses it to an "ⓘ"
          // that expands on tap instead of the full text bar.
          attributionControl={{ compact: true }}
          style={{ width: "100%", height: "100%" }}
        >
          {mapped.map((event) => {
            const { Icon } = CATEGORY_META[event.category];
            return (
              <Marker
                key={event.id}
                longitude={event.lng!}
                latitude={event.lat!}
                anchor="center"
              >
                <button
                  type="button"
                  onClick={() => setSelected(event)}
                  aria-label={`${event.title} — ${event.place}`}
                  className={cn(
                    "grid size-9 place-items-center rounded-full bg-navy text-gold shadow-[0_6px_16px_-6px_rgba(9,25,53,0.6)] ring-2 ring-cream transition-transform",
                    "hover:z-10 hover:scale-110 focus-visible:z-10 focus-visible:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  )}
                >
                  <Icon className="size-[18px]" aria-hidden />
                </button>
              </Marker>
            );
          })}
        </Map>

        {/* Soft vignette so the pins and badge read over any tile. */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/5 via-transparent to-black/10" />

        <span className="pointer-events-none absolute bottom-2.5 left-2.5 rounded-full bg-background/90 px-2.5 py-1 text-[11px] font-semibold text-foreground shadow-sm ring-1 ring-border backdrop-blur">
          {mapped.length === events.length
            ? `${events.length} ${events.length === 1 ? "event" : "events"}`
            : `${mapped.length} of ${events.length} events on the map`}
        </span>
      </div>

      <EventPreviewDialog event={selected} onClose={() => setSelected(null)} />
    </>
  );
}
