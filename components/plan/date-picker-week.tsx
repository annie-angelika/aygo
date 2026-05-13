"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils";

const DAY_LABELS = ["L", "M", "M", "J", "V", "S", "D"] as const;

export type DatePickerWeekProps = {
  /** Index (0-6) of the currently selected day. */
  selectedIndex: number;
  onSelect: (index: number, date: Date) => void;
  /** First day of the week to render. Defaults to today. */
  startDate?: Date;
  className?: string;
};

/**
 * Compact 7-day inline picker. We render `startDate` and the 6 days that
 * follow it; the parent owns the selected index so this stays controlled.
 */
export function DatePickerWeek({
  selectedIndex,
  onSelect,
  startDate,
  className,
}: DatePickerWeekProps) {
  const days = useMemo(() => {
    const base = startDate ? new Date(startDate) : new Date();
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(base);
      d.setDate(base.getDate() + i);
      return d;
    });
  }, [startDate]);

  return (
    <div
      role="radiogroup"
      className={cn("grid grid-cols-7 gap-1.5 text-center", className)}
    >
      {DAY_LABELS.map((d, i) => (
        <p
          key={i}
          className="text-[10.5px] font-semibold uppercase text-slate-500"
        >
          {d}
        </p>
      ))}
      {days.map((d, i) => {
        const isActive = selectedIndex === i;
        return (
          <button
            key={d.toISOString()}
            type="button"
            role="radio"
            aria-checked={isActive}
            aria-label={d.toLocaleDateString("es-BO", {
              weekday: "long",
              day: "numeric",
              month: "long",
            })}
            onClick={() => onSelect(i, d)}
            className={cn(
              "mx-auto grid size-9 place-items-center rounded-full text-[13px] font-semibold transition-colors",
              isActive
                ? "bg-blue-500 text-white"
                : "bg-blue-50 text-slate-700 hover:bg-blue-100",
            )}
          >
            {d.getDate()}
          </button>
        );
      })}
    </div>
  );
}
