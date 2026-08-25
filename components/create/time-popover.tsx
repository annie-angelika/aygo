"use client";

import { useEffect, useRef } from "react";

import { Popover, PopoverTrigger, PopoverContent, PopoverClose } from "@/components/ui/popover";
import { formatTimePill } from "@/lib/date-utils";
import { cn } from "@/lib/utils";

// Every half hour of the day, as "HH:mm".
const SLOTS = Array.from({ length: 48 }, (_, i) => {
  const h = Math.floor(i / 2);
  const m = i % 2 === 0 ? "00" : "30";
  return `${String(h).padStart(2, "0")}:${m}`;
});

/** Time picker with its own design — a scrollable list of half-hour slots. */
export function TimePopover({
  value,
  onChange,
  children,
}: {
  value: string;
  onChange: (value: string) => void;
  children: React.ReactNode;
}) {
  return (
    <Popover>
      <PopoverTrigger render={children as React.ReactElement} />
      <PopoverContent align="center" initialFocus={false} className="w-40 p-1.5">
        <TimeList value={value} onChange={onChange} />
      </PopoverContent>
    </Popover>
  );
}

function TimeList({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const ref = useRef<HTMLDivElement>(null);

  // Open scrolled to the current selection so it's centered, like a wheel picker.
  useEffect(() => {
    const el = ref.current?.querySelector<HTMLElement>('[data-selected="true"]');
    el?.scrollIntoView({ block: "center" });
  }, []);

  return (
    <div ref={ref} className="max-h-64 overflow-y-auto no-scrollbar">
      {SLOTS.map((slot) => {
        const selected = slot === value;
        return (
          <PopoverClose
            key={slot}
            render={
              <button
                type="button"
                data-selected={selected}
                onClick={() => onChange(slot)}
                className={cn(
                  "flex w-full items-center justify-center rounded-xl px-3 py-2 text-[13.5px] font-medium transition-colors",
                  selected
                    ? "bg-primary font-semibold text-primary-foreground"
                    : "text-foreground hover:bg-muted",
                )}
              >
                {formatTimePill(slot)}
              </button>
            }
          />
        );
      })}
    </div>
  );
}
