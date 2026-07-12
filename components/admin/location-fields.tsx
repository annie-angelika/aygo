"use client";

// The event form's location block: city + place with suggestions from what
// already exists (no more typo'd duplicate cities), and a map pin instead of
// raw latitude/longitude fields. Editing the address drops the pin so the
// server re-geocodes on save — unless the admin placed it by hand just now.

import { useState } from "react";

import { Field } from "@/components/ui/field";
import { SuggestInput } from "@/components/ui/suggest-input";
import { MapPicker } from "@/components/admin/map-picker";
import { useCities } from "@/hooks/use-discover";
import { useEvents } from "@/hooks/use-events";
import { cityKey } from "@/lib/utils";

type Patch = { city?: string; place?: string; lat?: number; lng?: number };

export function LocationFields({
  city,
  place,
  lat,
  lng,
  onChange,
}: {
  city: string;
  place: string;
  lat?: number;
  lng?: number;
  onChange: (patch: Patch) => void;
}) {
  const { cities } = useCities();
  const { data: events } = useEvents();
  const [pinnedByHand, setPinnedByHand] = useState(false);

  // Every known city, deduped case-insensitively — the curated city pages'
  // casing wins over whatever an event row happens to carry.
  const cityOptions = [
    ...new Map([
      ...events.map((e) => [cityKey(e.city), e.city] as const),
      ...cities.map((c) => [cityKey(c.name), c.name] as const),
    ]).values(),
  ];
  const placeOptions = [
    ...new Set(
      events
        .filter((e) => !city.trim() || cityKey(e.city) === cityKey(city))
        .map((e) => e.place),
    ),
  ];

  const setAddress = (patch: Patch) =>
    onChange(pinnedByHand ? patch : { ...patch, lat: undefined, lng: undefined });

  return (
    <>
      <div className="grid grid-cols-2 gap-2.5">
        <Field label="City">
          <SuggestInput
            listId="admin-city-options"
            options={cityOptions}
            value={city}
            onChange={(e) => setAddress({ city: e.target.value })}
            placeholder="La Paz"
            required
          />
        </Field>
        <Field label="Place">
          <SuggestInput
            listId="admin-place-options"
            options={placeOptions}
            value={place}
            onChange={(e) => setAddress({ place: e.target.value })}
            placeholder="Killi Killi Lookout"
            required
          />
        </Field>
      </div>
      <div className="flex min-w-0 flex-col gap-1.5">
        <span className="text-[12px] font-semibold text-foreground">
          Pin on the map
        </span>
        <MapPicker
          lat={lat}
          lng={lng}
          onChange={(c) => {
            setPinnedByHand(Boolean(c));
            onChange(c ?? { lat: undefined, lng: undefined });
          }}
        />
      </div>
    </>
  );
}
