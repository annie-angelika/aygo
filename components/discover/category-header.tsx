"use client";

import { LuCalendar } from "react-icons/lu";

import { BackButton } from "@/components/ui/back-button";
import { Separator } from "@/components/ui/separator";
import { Stat } from "@/components/ui/stat";
import { CATEGORY_META } from "@/lib/events-data";
import { findCategoryPage } from "@/lib/discover-data";
import { useCategoryStat } from "@/hooks/use-discover";
import type { Category } from "@/types";

/**
 * Banner-less interest header: a navy tile with the interest's icon in gold,
 * the name, the live event count, and a blurb. Used by the category page.
 * Copy renders instantly from the seed; the real event count comes from the
 * backend (`useCategoryStat`).
 */
export function CategoryHeader({ category }: { category: Category }) {
  const { Icon } = CATEGORY_META[category];
  const { stat } = useCategoryStat(category);
  const info = stat ?? findCategoryPage(category);

  return (
    <div className="flex flex-col gap-3.5 lg:gap-4 lg:pt-2">
      {/* Back, title, and logo share one row so the header reads wide, not tall. */}
      <div className="flex items-center gap-3 lg:gap-4">
        <BackButton className="shrink-0 bg-card ring-1 ring-border hover:bg-secondary/60" />
        <h1 className="min-w-0 flex-1 truncate text-[28px] font-bold leading-[1.1] tracking-[-0.03em] text-foreground lg:text-[40px]">
          {category}
        </h1>
        <span
          className="grid size-16 shrink-0 place-items-center rounded-[20px] bg-primary text-gold lg:size-20 lg:rounded-[24px]"
          aria-hidden
        >
          <Icon className="size-8 lg:size-10" />
        </span>
      </div>

      <span className="inline-flex items-center gap-1.5">
        <LuCalendar className="size-4 text-muted-foreground" aria-hidden />
        <Stat inline value={stat ? String(stat.count) : "—"} label="events" />
      </span>

      <Separator />

      {info?.blurb && (
        <p className="text-[13.5px] leading-[1.55] text-foreground/80 lg:max-w-2xl lg:text-[15px]">
          {info.blurb}
        </p>
      )}
    </div>
  );
}
