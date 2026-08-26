import Link from "next/link";
import { LuMap } from "react-icons/lu";

import { BackButton } from "@/components/ui/back-button";
import { IllimaniRidge } from "@/components/ui/brand-icons";

/**
 * Generic identity header on a navy sky, matching the city hero: back + map
 * actions up top, the logo tile with a gold outline beside the name and meta,
 * an optional badge, the blurb, and the Illimani ridge closing the block.
 * Breaks out of the page padding to run full-bleed. Callers supply the `logo`
 * node and `meta` row so the same shell serves community calendars and alike.
 * The navy sky is the banner — there is no cover image.
 */
export function ProfileHero({
  logo,
  name,
  meta,
  blurb,
  badge,
  mapHref,
}: {
  logo: React.ReactNode;
  name: string;
  meta: React.ReactNode;
  blurb: string;
  badge?: React.ReactNode;
  /** When set, the map button links to this dedicated map screen. */
  mapHref?: string;
}) {
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
          className="grid size-[72px] shrink-0 place-items-center overflow-hidden rounded-2xl bg-white/10 outline outline-1 outline-offset-[3px] outline-gold/80"
          aria-hidden
        >
          {logo}
        </span>
        <div className="min-w-0">
          {badge && <div className="mb-1.5">{badge}</div>}
          <h1 className="truncate text-[30px] font-bold leading-[1.1] tracking-[-0.03em] lg:text-[40px]">
            {name}
          </h1>
          <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[12.5px] text-cream/70">
            {meta}
          </div>
        </div>
      </div>

      <p className="relative max-w-2xl text-[13px] leading-relaxed text-cream/80 lg:text-[14px]">
        {blurb}
      </p>
    </section>
  );
}
