"use client";

import { LuMapPin } from "react-icons/lu";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CITIES, CITY_DATA } from "@/lib/cities-data";

/** Cities grouped under their country, in seed order (Bolivia first). */
const GROUPS = (() => {
  const map = new Map<string, typeof CITY_DATA>();
  for (const c of CITY_DATA) map.set(c.country, [...(map.get(c.country) ?? []), c]);
  return [...map.entries()];
})();

/**
 * Explicit city picker for the create flow. The event's city was previously
 * inferred from the location text (and silently fell back to La Paz); choosing
 * it here makes the grouping deliberate and bounds the location search to
 * that city. Grouped by country so Bolivia's ~30 cities stay scannable. The
 * trigger shows the chosen city's landmark in a navy tile.
 */
export function CitySelect({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const Mark = CITIES.find((c) => c.name === value)?.Icon ?? LuMapPin;

  return (
    <Select value={value} onValueChange={(v) => onChange((v as string) ?? value)}>
      <SelectTrigger className="h-12 w-full rounded-2xl bg-card px-3 text-[14px] font-semibold">
        <span className="flex min-w-0 items-center gap-2.5">
          <span
            className="grid size-7 shrink-0 place-items-center rounded-lg bg-primary text-primary-foreground"
            aria-hidden
          >
            <Mark className="size-[15px]" />
          </span>
          <SelectValue placeholder="Select city">
            {(v) => (v as string) || "Select city"}
          </SelectValue>
        </span>
      </SelectTrigger>
      <SelectContent alignItemWithTrigger={false} className="max-h-[60svh]">
        {GROUPS.map(([country, cities]) => (
          <SelectGroup key={country}>
            <SelectLabel>{country}</SelectLabel>
            {cities.map((c) => (
              <SelectItem key={c.slug} value={c.name}>
                {c.name}
              </SelectItem>
            ))}
          </SelectGroup>
        ))}
      </SelectContent>
    </Select>
  );
}
