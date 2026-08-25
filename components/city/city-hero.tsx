import Link from "next/link";
import { LuMap, LuMapPin } from "react-icons/lu";

import { BackButton } from "@/components/ui/back-button";
import { IllimaniRidge } from "@/components/ui/brand-icons";
import type { City } from "@/lib/cities-data";

/**
 * City header: a navy sky with the department's landmark as a stamp, the name,
 * country + live count, tagline, and the map action. The Illimani ridge closes
 * the block. Breaks out of the page padding to run full-bleed.
 */
export function CityHero({ city, mapHref }: { city: City; mapHref?: string }) {
  return (
    <section className="relative -mx-4 -mt-3 flex flex-col gap-3.5 overflow-hidden rounded-b-3xl bg-navy px-4 pb-16 pt-2 text-cream lg:mt-1 lg:rounded-3xl lg:px-8 lg:pb-20 lg:pt-4">
      <IllimaniRidge />

      <div className="relative flex items-center justify-between">
        <BackButton className="bg-white/10 text-cream ring-1 ring-white/15 hover:bg-white/15" />
        {mapHref && (
          <Link
            href={mapHref}
            aria-label="View on map"
            className="grid size-9 place-items-center rounded-full bg-white/10 text-cream ring-1 ring-white/15 transition-colors hover:bg-white/15"
          >
            <LuMap className="size-[18px]" aria-hidden />
          </Link>
        )}
      </div>

      <div className="relative flex items-center gap-3.5">
        <span
          className="grid size-[72px] shrink-0 place-items-center rounded-full bg-white/10 text-cream outline outline-1 outline-offset-[3px] outline-gold/80"
          aria-hidden
        >
          <city.Icon className="size-10" />
        </span>
        <div className="min-w-0">
          <h1 className="truncate text-[30px] font-bold leading-[1.1] tracking-[-0.03em] lg:text-[40px]">
            {city.name}
          </h1>
          <p className="mt-1 inline-flex items-center gap-1.5 text-[12.5px] text-cream/70">
            <LuMapPin className="size-3.5 shrink-0" aria-hidden />
            {city.country}
            <span aria-hidden>·</span>
            {city.eventCount} {city.eventCount === 1 ? "event" : "events"}
          </p>
        </div>
      </div>

      <p className="relative max-w-2xl text-[13px] leading-relaxed text-cream/80 lg:text-[14px]">
        {city.tagline ?? `Discover what's happening across ${city.name}.`}
      </p>
    </section>
  );
}
