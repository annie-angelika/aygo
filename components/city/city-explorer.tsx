"use client";

import { LuMapPinned } from "react-icons/lu";

import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { CityCard } from "@/components/city/city-card";
import { DEPARTMENT_CAPITALS, withCityMeta } from "@/lib/cities-data";
import { useCities } from "@/hooks/use-discover";

/**
 * The "Explore Bolivia" grid for Discover: the nine department capitals as
 * landmark stamps, three per row. Cities (and their real event counts) come from the
 * backend; the mark is client presentation joined in via `withCityMeta`.
 * Cities outside Bolivia stay reachable by URL, just not from this grid yet.
 */
export function CityExplorer() {
  const { cities: all, loading } = useCities();
  // The nine department capitals, in brand order; the rest of the catalogue
  // (El Alto, towns, cities abroad) stays reachable by URL and search.
  const cities = DEPARTMENT_CAPITALS.map((slug) => all.find((c) => c.slug === slug))
    .filter((c): c is NonNullable<typeof c> => c != null)
    .map(withCityMeta);

  if (loading && all.length === 0) {
    return (
      <div className="grid grid-cols-3 gap-x-2 gap-y-3">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex flex-col items-center gap-2 py-1.5">
            <Skeleton className="size-[60px] rounded-full" />
            <Skeleton className="h-3 w-14 rounded" />
          </div>
        ))}
      </div>
    );
  }

  if (cities.length === 0) {
    return (
      <EmptyState
        icon={LuMapPinned}
        title="No cities yet"
        subtitle="We're still mapping events in Bolivia — check back soon."
      />
    );
  }

  return (
    <div className="grid grid-cols-3 gap-x-2 gap-y-3 md:grid-cols-5 lg:grid-cols-9">
      {cities.map((c) => (
        <CityCard key={c.slug} city={c} />
      ))}
    </div>
  );
}
