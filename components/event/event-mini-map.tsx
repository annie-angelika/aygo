"use client";

// Small interactive map for one venue (event detail). Cooperative gestures so
// it never hijacks the page scroll: two fingers pan on touch, Ctrl/⌘+scroll
// zooms on desktop — MapLibre shows the hint automatically.

import { Map, Marker } from "@vis.gl/react-maplibre";
import "maplibre-gl/dist/maplibre-gl.css";
import { LuMapPin } from "react-icons/lu";

import { cn } from "@/lib/utils";

const MAP_STYLE = "https://tiles.openfreemap.org/styles/positron";

export function EventMiniMap({
  lat,
  lng,
  label,
  className,
}: {
  lat: number;
  lng: number;
  label: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "h-44 w-full overflow-hidden rounded-2xl ring-1 ring-border",
        className,
      )}
    >
      <Map
        initialViewState={{ longitude: lng, latitude: lat, zoom: 15 }}
        mapStyle={MAP_STYLE}
        cooperativeGestures
        // Compact "ⓘ" attribution (required by the OSM data license).
        attributionControl={{ compact: true }}
        style={{ width: "100%", height: "100%" }}
      >
        <Marker longitude={lng} latitude={lat} anchor="bottom">
          <span
            aria-label={label}
            className="grid size-9 place-items-center rounded-full bg-white text-amber-600 shadow-[0_6px_16px_-6px_rgba(15,23,42,0.55)] ring-1 ring-black/5"
          >
            <LuMapPin className="size-[18px]" aria-hidden />
          </span>
        </Marker>
      </Map>
    </div>
  );
}
