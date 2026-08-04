"use client";

import { LuMapPin } from "react-icons/lu";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CITY_DATA } from "@/lib/cities-data";

/**
 * Explicit city picker for the create flow. The event's city was previously
 * inferred from the location text (and silently fell back to La Paz); choosing
 * it here makes the grouping deliberate and biases the location search.
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
      <SelectContent alignItemWithTrigger={false}>
        {CITY_DATA.map((c) => (
          <SelectItem key={c.slug} value={c.name}>
            {c.name}, {c.country}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
