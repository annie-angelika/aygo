"use client";

import { CATEGORIES, CATEGORY_META } from "@/lib/events-data";
import { cn } from "@/lib/utils";
import type { Category } from "@/types";

/**
 * Interest picker for the create flow — a gold "Category" eyebrow over one
 * scrollable row of interest tiles (the same tiles Discover browses by). The
 * chosen one flips to navy with a gold icon; the rest stay navy-soft.
 */
export function CategorySelect({
  value,
  onChange,
}: {
  value: Category;
  onChange: (value: Category) => void;
}) {
  return (
    <div className="flex flex-col gap-2.5">
      <p className="text-[10.5px] font-semibold uppercase tracking-[0.08em] text-gold-deep">
        Category
      </p>
      <div className="no-scrollbar -mx-4 flex gap-3 overflow-x-auto px-4 py-0.5">
        {CATEGORIES.map((c) => {
          const { Icon } = CATEGORY_META[c];
          const selected = c === value;
          return (
            <button
              key={c}
              type="button"
              onClick={() => onChange(c)}
              aria-pressed={selected}
              className="group flex w-16 shrink-0 flex-col items-center gap-1.5"
            >
              <span
                className={cn(
                  "grid size-14 place-items-center rounded-[18px] transition-all group-hover:-translate-y-0.5",
                  selected
                    ? "bg-primary text-gold shadow-[0_10px_20px_-12px_rgba(9,25,53,0.6)]"
                    : "bg-secondary text-foreground group-hover:bg-navy-soft/70",
                )}
              >
                <Icon className="size-[26px]" aria-hidden />
              </span>
              <span className="text-[11.5px] font-semibold text-foreground">{c}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
