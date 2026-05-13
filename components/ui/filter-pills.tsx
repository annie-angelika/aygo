"use client";

import { cn } from "@/lib/utils";

/**
 * Horizontally-scrolling pill list with a single active item. Generic over
 * the value type so consumers get fully-typed `onSelect` callbacks.
 */
export type FilterPillsProps<T extends string> = {
  items: readonly T[];
  active: T;
  onSelect: (item: T) => void;
  className?: string;
};

export function FilterPills<T extends string>({
  items,
  active,
  onSelect,
  className,
}: FilterPillsProps<T>) {
  return (
    <div
      role="tablist"
      className={cn(
        "-mx-5 flex gap-2 overflow-x-auto px-5 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
        className,
      )}
    >
      {items.map((item) => {
        const isActive = active === item;
        return (
          <button
            key={item}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onSelect(item)}
            className={cn(
              "shrink-0 rounded-full px-4 py-1.5 text-[12.5px] font-semibold transition-colors",
              isActive
                ? "bg-amber-300 text-slate-900"
                : "bg-white/70 text-slate-700 ring-1 ring-white",
            )}
          >
            {item}
          </button>
        );
      })}
    </div>
  );
}
