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
import { CITY_DATA } from "@/lib/cities-data";

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
 * that city. Grouped by country so Bolivia's ~30 cities stay scannable.
 */
export function CitySelect({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <Select value={value} onValueChange={(v) => onChange((v as string) ?? value)}>
      <SelectTrigger className="h-11 w-full rounded-2xl bg-muted px-3.5 text-[13px] font-medium">
        <span className="flex items-center gap-2">
          <LuMapPin className="size-4 text-muted-foreground" aria-hidden />
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
