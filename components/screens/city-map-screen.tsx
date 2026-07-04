import { MapScreen } from "@/components/discover/map-screen";
import { CATEGORIES } from "@/lib/events-data";
import { findCity } from "@/lib/cities-data";
import { cn } from "@/lib/utils";
import type { Category } from "@/types";

/** Dedicated map view for a city, at /<city>/map. */
export function CityMapScreen({
  slug,
  initialInterest,
}: {
  slug: string;
  initialInterest?: string;
}) {
  const city = findCity(slug);
  if (!city) return null;

  const defaultInterest = (CATEGORIES as string[]).includes(initialInterest ?? "")
    ? (initialInterest as Category)
    : undefined;

  return (
    <MapScreen
      title={city.name}
      city={city.name}
      filterCity={city.name}
      defaultInterest={defaultInterest}
      logo={
        <span
          className={cn(
            "grid size-9 shrink-0 place-items-center rounded-lg text-white",
            city.tint,
          )}
          aria-hidden
        >
          <city.Icon className="size-[18px]" />
        </span>
      }
    />
  );
}
