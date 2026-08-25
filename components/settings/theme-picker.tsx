"use client";

import { LuCheck } from "react-icons/lu";

import { cn } from "@/lib/utils";
import type { ThemePref } from "@/types";

/** A tiny window mockup so each option reads as a real appearance. */
function Preview({ theme }: { theme: ThemePref }) {
  if (theme === "system") {
    return (
      <div className="relative h-16 overflow-hidden rounded-lg ring-1 ring-foreground/8">
        <div className="absolute inset-0 bg-cream" />
        <div className="absolute inset-y-0 right-0 w-1/2 bg-[#1c1c1f]" />
        <div className="absolute left-2.5 top-2.5 text-[11px] font-semibold text-navy">
          Aa
        </div>
        <div className="absolute right-2.5 top-2.5 text-[11px] font-semibold text-white">
          Aa
        </div>
      </div>
    );
  }
  const dark = theme === "dark";
  return (
    <div
      className={cn(
        "relative h-16 overflow-hidden rounded-lg ring-1 ring-foreground/8",
        dark ? "bg-[#1c1c1f]" : "bg-cream",
      )}
    >
      <div className="absolute left-2.5 top-2.5 flex gap-1">
        <span className="size-1.5 rounded-full bg-current opacity-30" />
        <span className="size-1.5 rounded-full bg-current opacity-30" />
        <span className="size-1.5 rounded-full bg-current opacity-30" />
      </div>
      <div
        className={cn(
          "absolute bottom-2.5 right-2.5 text-[11px] font-semibold",
          dark ? "text-white" : "text-navy",
        )}
      >
        Aa
      </div>
    </div>
  );
}

const OPTIONS: { value: ThemePref; label: string }[] = [
  { value: "system", label: "System" },
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
];

/** Display section — pick the app appearance (System / Light / Dark). */
export function ThemePicker({
  value,
  onChange,
}: {
  value: ThemePref;
  onChange: (theme: ThemePref) => void;
}) {
  return (
    <div className="grid grid-cols-3 gap-2.5">
      {OPTIONS.map(({ value: v, label }) => {
        const active = v === value;
        return (
          <button
            key={v}
            type="button"
            onClick={() => onChange(v)}
            aria-pressed={active}
            className={cn(
              "flex flex-col gap-2 rounded-2xl bg-card p-2 text-left ring-1 transition-colors",
              active
                ? "ring-2 ring-gold"
                : "ring-border hover:ring-gold/50",
            )}
          >
            <Preview theme={v} />
            <span className="flex items-center justify-between px-0.5">
              <span className="text-[12.5px] font-semibold text-foreground">
                {label}
              </span>
              {active && (
                <span className="grid size-4 place-items-center rounded-full bg-gold text-navy">
                  <LuCheck className="size-3" aria-hidden />
                </span>
              )}
            </span>
          </button>
        );
      })}
    </div>
  );
}
