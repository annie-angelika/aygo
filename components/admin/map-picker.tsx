"use client";

// Pin picker for the admin event form: tap the map to drop the pin, drag it to
// fine-tune, or clear it so the server re-geocodes from place + city on save.
// Same tiles and pin styling as EventMiniMap (the read-only sibling).

import { Map, Marker } from "@vis.gl/react-maplibre";
import "maplibre-gl/dist/maplibre-gl.css";
import { LuMapPin, LuX } from "react-icons/lu";

import { Button } from "@/components/ui/button";

const MAP_STYLE = "https://tiles.openfreemap.org/styles/positron";
/** No pin yet → start wide over Bolivia; neighbors are one zoom-out away. */
const FALLBACK = { longitude: -63.59, latitude: -16.29, zoom: 3.5 };

export function MapPicker({
  lat,
  lng,
  onChange,
}: {
  lat?: number;
  lng?: number;
  /** `null` clears the pin (server geocodes the address at save time). */
  onChange: (coords: { lat: number; lng: number } | null) => void;
}) {
  const pin = lat != null && lng != null ? { lat, lng } : null;
  return (
    <div className="flex flex-col gap-1.5">
      <div className="h-40 w-full overflow-hidden rounded-xl ring-1 ring-border">
        <Map
          initialViewState={
            pin ? { longitude: pin.lng, latitude: pin.lat, zoom: 14 } : FALLBACK
          }
          mapStyle={MAP_STYLE}
          cooperativeGestures
          attributionControl={{ compact: true }}
          style={{ width: "100%", height: "100%" }}
          cursor="crosshair"
          onClick={(e) => onChange({ lat: e.lngLat.lat, lng: e.lngLat.lng })}
        >
          {pin && (
            <Marker
              longitude={pin.lng}
              latitude={pin.lat}
              anchor="bottom"
              draggable
              onDragEnd={(e) =>
                onChange({ lat: e.lngLat.lat, lng: e.lngLat.lng })
              }
            >
              <span className="grid size-9 place-items-center rounded-full bg-navy text-gold shadow-[0_6px_16px_-6px_rgba(9,25,53,0.6)] ring-2 ring-cream">
                <LuMapPin className="size-[18px]" aria-hidden />
              </span>
            </Marker>
          )}
        </Map>
      </div>
      <div className="flex min-h-7 items-center justify-between gap-2">
        <p className="min-w-0 truncate text-[11px] text-muted-foreground">
          {pin
            ? `${pin.lat.toFixed(5)}, ${pin.lng.toFixed(5)}`
            : "No pin — it's placed automatically from place + city on save."}
        </p>
        {pin && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-7 shrink-0 gap-1 rounded-full px-2.5 text-[11px]"
            onClick={() => onChange(null)}
          >
            <LuX className="size-3" aria-hidden /> Clear pin (auto)
          </Button>
        )}
      </div>
    </div>
  );
}
