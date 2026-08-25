"use client";

// The "Browse by interest" row: one line of tiles, scrolling sideways, fed by
// real per-category event counts from the backend (`useCategoryStats`).
// Skeleton tiles hold the layout on the first uncached load.

import { CategoryCard } from "@/components/discover/category-card";
import { Skeleton } from "@/components/ui/skeleton";
import { useCategoryStats } from "@/hooks/use-discover";

export function InterestRow() {
  const { stats, loading } = useCategoryStats();

  return (
    <div className="no-scrollbar -mx-4 overflow-x-auto py-1 lg:mx-0 lg:overflow-visible">
      <div className="flex w-max gap-3 px-4 lg:w-auto lg:gap-6 lg:px-0">
        {loading && stats.length === 0
          ? [0, 1, 2, 3, 4].map((i) => (
              <div key={i} className="flex w-16 flex-col items-center gap-1.5">
                <Skeleton className="size-14 rounded-[18px]" />
                <Skeleton className="h-3 w-10 rounded" />
              </div>
            ))
          : stats.map((s) => (
              <CategoryCard key={s.category} category={s.category} count={s.count} />
            ))}
      </div>
    </div>
  );
}
