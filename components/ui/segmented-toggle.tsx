"use client";

import { cn } from "@/lib/utils";

export type SegmentedToggleOption<T extends string> = {
  value: T;
  label: string;
};

export type SegmentedToggleProps<T extends string> = {
  options: ReadonlyArray<SegmentedToggleOption<T>>;
  value: T;
  onChange: (value: T) => void;
  className?: string;
};

/**
 * Pill-shaped 2+ option toggle (e.g. "Línea de tiempo / Modo historia").
 * Generic so the value union flows through to the change handler.
 */
export function SegmentedToggle<T extends string>({
  options,
  value,
  onChange,
  className,
}: SegmentedToggleProps<T>) {
  return (
    <div
      role="radiogroup"
      className={cn(
        "inline-flex w-fit gap-1 rounded-full bg-white/70 p-1 ring-1 ring-white",
        className,
      )}
    >
      {options.map((opt) => {
        const isActive = value === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            role="radio"
            aria-checked={isActive}
            onClick={() => onChange(opt.value)}
            className={cn(
              "rounded-full px-4 py-1.5 text-[12.5px] font-semibold transition-colors",
              isActive ? "bg-slate-900 text-white" : "text-slate-600",
            )}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
