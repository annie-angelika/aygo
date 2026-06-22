import { LuMapPin } from "react-icons/lu";

import { ProfileHero } from "@/components/discover/profile-hero";
import { cn } from "@/lib/utils";
import type { City } from "@/lib/cities-data";

/** Luma-style city header — a city identity on top of the shared ProfileHero. */
export function CityHero({
  city,
  subscribed,
  onToggleSubscribe,
}: {
  city: City;
  subscribed: boolean;
  onToggleSubscribe: () => void;
}) {
  return (
    <ProfileHero
      cover={`https://picsum.photos/seed/city-${city.slug}/800/400`}
      logo={
        <span
          className={cn(
            "grid size-[68px] place-items-center rounded-2xl text-white shadow-[0_12px_24px_-12px_rgba(15,23,42,0.5)] ring-4 ring-card",
            city.tint,
          )}
          aria-hidden
        >
          <city.Icon className="size-8" />
        </span>
      }
      name={city.name}
      meta={
        <span className="inline-flex items-center gap-1.5">
          <LuMapPin className="size-3.5 shrink-0" aria-hidden />
          {city.country}
          <span aria-hidden>·</span>
          {city.eventCount} events
        </span>
      }
      blurb={city.tagline ?? `Discover what's happening across ${city.name}.`}
      following={subscribed}
      onToggleFollow={onToggleSubscribe}
    />
  );
}
