"use client";

import { useState } from "react";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CityCard } from "@/components/city/city-card";
import { REGIONS, CITIES, type Region } from "@/lib/cities-data";

/** Region tabs + city grid for the Discover "Explore Local Events" section. */
export function CityExplorer() {
  const [region, setRegion] = useState<Region>("South America");
  const cities = CITIES.filter((c) => c.region === region);

  return (
    <div className="flex flex-col gap-3">
      <Tabs value={region} onValueChange={(v) => setRegion(v as Region)}>
        <TabsList className="w-full justify-start overflow-x-auto">
          {REGIONS.map((r) => (
            <TabsTrigger key={r} value={r} className="flex-none whitespace-nowrap">
              {r}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <div className="grid grid-cols-2 gap-x-3 gap-y-1.5">
        {cities.map((c) => (
          <CityCard key={c.slug} city={c} />
        ))}
      </div>
    </div>
  );
}
