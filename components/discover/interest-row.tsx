"use client";

// The "Browse by interest" scroll row, fed by real per-category event counts
// from the backend (`useCategoryStats`). Skeleton tiles hold the layout on the
// first uncached load.

import { CategoryCard } from "@/components/discover/category-card";
import { Skeleton } from "@/components/ui/skeleton";
import { useCategoryStats } from "@/hooks/use-discover";

export function InterestRow() {
  const { stats, loading } = useCategoryStats();

  return (
    <div className="no-scrollbar -mx-4 overflow-x-auto py-1.5">
      <div className="flex w-max gap-2 px-4">
        {loading && stats.length === 0
          ? [0, 1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-[54px] w-32 rounded-xl" />
            ))
          : stats.map((s) => (
              <CategoryCard
                key={s.category}
                category={s.category}
                count={s.count}
              />
            ))}
      </div>
    </div>
  );
}
