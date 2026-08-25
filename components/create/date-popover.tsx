"use client";

import { useState } from "react";
import { LuChevronLeft, LuChevronRight } from "react-icons/lu";

import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import {
  MONTHS as MONTH_NAMES,
  buildMonthGrid,
  parseDate,
  todayValue,
  WEEKDAY_INITIALS,
} from "@/lib/date-utils";
import { cn } from "@/lib/utils";

/**
 * A Luma-style date picker: month grid you page through one month at a time with
 * the arrows (no year dropdown — the year only shows faintly when it differs from
 * today's), and a dot button that jumps back to the current month.
 */
export function DatePopover({
  value,
  min,
  onChange,
  children,
}: {
  value: string;
  /** Earliest pickable "YYYY-MM-DD" (inclusive) — days before it are disabled. */
  min?: string;
  onChange: (value: string) => void;
  children: React.ReactNode;
}) {
  const base = value ? parseDate(value) : new Date();
  const [view, setView] = useState({ y: base.getFullYear(), m: base.getMonth() });

  const today = todayValue();
  const now = new Date();
  const grid = buildMonthGrid(view.y, view.m);

  const shift = (delta: number) => {
    const d = new Date(view.y, view.m + delta, 1);
    setView({ y: d.getFullYear(), m: d.getMonth() });
  };
  const goToday = () => setView({ y: now.getFullYear(), m: now.getMonth() });

  // Reopen on the month of the current value (it may have moved since mount).
  const syncView = (open: boolean) => {
    if (!open) return;
    const d = value ? parseDate(value) : new Date();
    setView({ y: d.getFullYear(), m: d.getMonth() });
  };

  return (
    <Popover onOpenChange={syncView}>
      <PopoverTrigger render={children as React.ReactElement} />
      <PopoverContent align="start" initialFocus={false} className="w-[300px] p-3">
        <div className="mb-2 flex items-center justify-between">
          <p className="text-[16px] font-semibold text-foreground">
            {MONTH_NAMES[view.m]}
            {view.y !== now.getFullYear() && (
              <span className="ml-1.5 font-normal text-muted-foreground">{view.y}</span>
            )}
          </p>
          <div className="flex items-center gap-0.5">
            <ArrowBtn label="Previous month" onClick={() => shift(-1)}>
              <LuChevronLeft className="size-4" />
            </ArrowBtn>
            <button
              type="button"
              onClick={goToday}
              aria-label="Go to today"
              className="grid size-7 place-items-center rounded-full text-muted-foreground transition-colors hover:text-foreground"
            >
              <span className="size-2 rounded-full bg-muted-foreground/60 transition-colors hover:bg-foreground" />
            </button>
            <ArrowBtn label="Next month" onClick={() => shift(1)}>
              <LuChevronRight className="size-4" />
            </ArrowBtn>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-y-1">
          {WEEKDAY_INITIALS.map((d, i) => (
            <span
              key={i}
              className="grid h-8 place-items-center text-[12px] font-medium text-muted-foreground"
            >
              {d}
            </span>
          ))}
          {grid.map(({ value: v, date, inMonth }) => {
            const selected = v === value;
            const isToday = v === today;
            // ISO date strings compare lexicographically, so this is a date compare.
            const disabled = !!min && v < min;
            return (
              <button
                key={v}
                type="button"
                disabled={disabled}
                aria-disabled={disabled}
                onClick={() => onChange(v)}
                className={cn(
                  "mx-auto grid size-9 place-items-center rounded-xl text-[13.5px] font-medium transition-colors",
                  selected
                    ? "bg-primary font-semibold text-primary-foreground"
                    : disabled
                      ? "cursor-not-allowed text-muted-foreground/30 line-through decoration-muted-foreground/30"
                      : inMonth
                        ? "text-foreground hover:bg-muted"
                        : "text-muted-foreground/40 hover:bg-muted",
                  !selected && isToday && "ring-1 ring-gold",
                )}
              >
                {date.getDate()}
              </button>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}

function ArrowBtn({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="grid size-7 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
    >
      {children}
    </button>
  );
}
