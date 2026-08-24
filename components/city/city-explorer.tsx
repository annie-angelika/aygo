"use client";

import { useState } from "react";
import { LuMapPinned } from "react-icons/lu";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { CityCard } from "@/components/city/city-card";
import { REGIONS, withCityMeta, type City, type Region } from "@/lib/cities-data";
import { useCities } from "@/hooks/use-discover";

/** Group a region's cities by country, keeping seed order. */
function groupByCountry(cities: City[]): [string, City[]][] {
  const groups = new Map<string, City[]>();
  for (const c of cities) groups.set(c.country, [...(groups.get(c.country) ?? []), c]);
  return [...groups];
}

/**
 * Region tabs + city grid for the Discover "Explore Local Events" section.
 * Cities (and their real event counts) come from the backend; the landmark
 * icon + tint are client presentation joined in via `withCityMeta`.
 */
export function CityExplorer() {
  const [region, setRegion] = useState<Region>("South America");
  const { cities: all, loading } = useCities();
  const cities = all.filter((c) => c.region === region).map(withCityMeta);

  return (
    <div className="flex flex-col gap-3">
      <Tabs value={region} onValueChange={(v) => setRegion(v as Region)}>
        <TabsList className="w-full">
          {REGIONS.map((r) => (
            <TabsTrigger key={r} value={r} className="flex-1 whitespace-nowrap">
              {r}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {loading && all.length === 0 ? (
        <div className="grid grid-cols-2 gap-x-3 gap-y-1.5">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-14 rounded-xl" />
          ))}
        </div>
      ) : cities.length > 0 ? (
        <div className="flex flex-col gap-3">
          {groupByCountry(cities).map(([country, list]) => (
            <section key={country} className="flex flex-col gap-1">
              <h3 className="px-2 text-[12.5px] font-semibold uppercase tracking-wide text-muted-foreground">
                {country}
              </h3>
              <div className="grid grid-cols-2 gap-x-3 gap-y-1.5">
                {list.map((c) => (
                  <CityCard key={c.slug} city={c} />
                ))}
              </div>
            </section>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={LuMapPinned}
          title="No cities yet"
          subtitle="We're still mapping events in this region — check back soon."
        />
      )}
    </div>
  );
}
