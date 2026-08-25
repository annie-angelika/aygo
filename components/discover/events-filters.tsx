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
import { CATEGORIES, CATEGORY_META } from "@/lib/events-data";
import { cn } from "@/lib/utils";
import type { Category } from "@/types";

type When = "upcoming" | "past";

/**
 * The Upcoming/Past + interest filters shared by the events list and the map.
 * `variant="tabs"` is the list layout: a scrolling row of interest chips (All +
 * each interest), then the segmented Upcoming/Past control on the right of an
 * optional `leading` slot (the board's heading). `variant="dropdowns"` is the
 * map layout (two Select pills). Same state either way.
 */
export function EventsFilters({
  variant,
  when,
  onWhenChange,
  interest,
  onInterestChange,
  showInterest,
  leading,
}: {
  variant: "tabs" | "dropdowns";
  when: When;
  onWhenChange: (when: When) => void;
  interest: Category | "all";
  onInterestChange: (interest: Category | "all") => void;
  showInterest: boolean;
  /** List variant only: sits left of the Upcoming/Past control. */
  leading?: React.ReactNode;
}) {
  if (variant === "tabs") {
    return (
      <div className="flex flex-col gap-4">
        {showInterest && <InterestChips value={interest} onChange={onInterestChange} />}
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0 flex-1">{leading}</div>
          <Tabs value={when} onValueChange={(v) => onWhenChange(v as When)}>
            <TabsList className="h-8 rounded-[11px]">
              <TabsTrigger value="upcoming" className="rounded-lg px-3 text-[12.5px]">
                Upcoming
              </TabsTrigger>
              <TabsTrigger value="past" className="rounded-lg px-3 text-[12.5px]">
                Past
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between gap-3">
      <Select value={when} onValueChange={(v) => onWhenChange(v as When)}>
        <SelectTrigger size="sm" className="h-9 w-[140px] rounded-full font-semibold">
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

      {showInterest && (
        <Select
          value={interest}
          onValueChange={(v) => onInterestChange(v as Category | "all")}
        >
          <SelectTrigger size="sm" className="h-9 w-[140px] rounded-full font-semibold">
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

/** One row of interest chips: "All" then every interest with its icon. */
function InterestChips({
  value,
  onChange,
}: {
  value: Category | "all";
  onChange: (interest: Category | "all") => void;
}) {
  return (
    <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 py-0.5 lg:mx-0 lg:flex-wrap lg:overflow-visible lg:px-0">
      <Chip active={value === "all"} onClick={() => onChange("all")} className="px-3.5">
        All
      </Chip>
      {CATEGORIES.map((c) => {
        const { Icon } = CATEGORY_META[c];
        const active = value === c;
        return (
          <Chip key={c} active={active} onClick={() => onChange(c)} className="pl-2.5 pr-3.5">
            <Icon className={cn("size-4", active ? "text-gold" : "text-foreground")} aria-hidden />
            {c}
          </Chip>
        );
      })}
    </div>
  );
}

function Chip({
  active,
  onClick,
  className,
  children,
}: {
  active: boolean;
  onClick: () => void;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "inline-flex h-9 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full text-[13px] font-semibold ring-1 transition-colors",
        active
          ? "bg-primary text-primary-foreground ring-transparent"
          : "bg-card text-foreground ring-border hover:bg-secondary/60",
        className,
      )}
    >
      {children}
    </button>
  );
}
