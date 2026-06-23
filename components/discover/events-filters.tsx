"use client";

import { LuClock, LuHistory } from "react-icons/lu";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { CATEGORIES } from "@/lib/events-data";
import type { Category } from "@/types";

type When = "upcoming" | "past";

/**
 * The Upcoming/Past + interest filters shared by the events list and the map.
 * `variant="tabs"` is the list layout (segmented tabs); `variant="dropdowns"`
 * is the map layout (two Select dropdowns, Luma-style). Same state either way.
 */
export function EventsFilters({
  variant,
  when,
  onWhenChange,
  interest,
  onInterestChange,
  showInterest,
}: {
  variant: "tabs" | "dropdowns";
  when: When;
  onWhenChange: (when: When) => void;
  interest: Category | "all";
  onInterestChange: (interest: Category | "all") => void;
  showInterest: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      {variant === "tabs" ? (
        <Tabs value={when} onValueChange={(v) => onWhenChange(v as When)}>
          <TabsList>
            <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
            <TabsTrigger value="past">Past</TabsTrigger>
          </TabsList>
        </Tabs>
      ) : (
        <Select value={when} onValueChange={(v) => onWhenChange(v as When)}>
          <SelectTrigger size="sm" className="w-[140px]">
            <SelectValue>
              {(val: string) => (
                <span className="inline-flex items-center gap-2">
                  {val === "past" ? (
                    <LuHistory className="size-4" />
                  ) : (
                    <LuClock className="size-4" />
                  )}
                  {val === "past" ? "Past" : "Upcoming"}
                </span>
              )}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="upcoming">
              <LuClock />
              Upcoming
            </SelectItem>
            <SelectItem value="past">
              <LuHistory />
              Past
            </SelectItem>
          </SelectContent>
        </Select>
      )}

      {showInterest && (
        <Select
          value={interest}
          onValueChange={(v) => onInterestChange(v as Category | "all")}
        >
          <SelectTrigger size="sm" className="w-[140px]">
            <SelectValue>
              {(val: string) => (val === "all" ? "All interests" : val)}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All interests</SelectItem>
            {CATEGORIES.map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </div>
  );
}
