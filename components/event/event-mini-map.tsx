"use client";

// Small interactive map for one venue (event detail). Cooperative gestures so
// it never hijacks the page scroll: two fingers pan on touch, Ctrl/⌘+scroll
// zooms on desktop — MapLibre shows the hint automatically.

import { Map, Marker } from "@vis.gl/react-maplibre";
import "maplibre-gl/dist/maplibre-gl.css";

import { AygoStar } from "@/components/ui/brand-icons";
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
        "h-[140px] w-full overflow-hidden rounded-[18px] bg-secondary ring-1 ring-foreground/8",
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
          {/* The aygo mark as the pin: a navy teardrop with the gold star. */}
          <span
            aria-label={label}
            className="grid size-9 -rotate-45 place-items-center rounded-[9999px_9999px_9999px_0] bg-navy shadow-[0_8px_16px_-8px_rgba(9,25,53,0.6)]"
          >
            <AygoStar className="size-4 rotate-45 text-gold" />
          </span>
        </Marker>
      </Map>
    </div>
  );
}
