"use client";

import { CATEGORIES, CATEGORY_META } from "@/lib/events-data";
import { cn } from "@/lib/utils";
import type { Category } from "@/types";

/**
 * Interest picker for the create flow — a scrollable row of category chips.
 * The event's category was previously never captured (every draft silently
 * became "Party"); choosing it here sets it deliberately. The selected chip
 * takes its category color, the rest stay muted.
 */
export function CategorySelect({
  value,
  onChange,
}: {
  value: Category;
  onChange: (value: Category) => void;
}) {
  return (
    <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4">
      {CATEGORIES.map((c) => {
        const { Icon, chip, accent } = CATEGORY_META[c];
        const selected = c === value;
        return (
          <button
            key={c}
            type="button"
            onClick={() => onChange(c)}
            aria-pressed={selected}
            className={cn(
              "inline-flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-2 text-[13px] font-semibold ring-1 transition-colors",
              selected
                ? cn(chip, "ring-transparent")
                : "bg-muted text-muted-foreground ring-border hover:bg-muted/70",
            )}
          >
            <Icon className={cn("size-4", selected || accent)} />
            {c}
          </button>
        );
      })}
    </div>
  );
}
