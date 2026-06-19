import Link from "next/link";
import type { Destination } from "@/types";
import { cn } from "@/lib/utils";

export type DestinationCardProps = {
  destination: Destination;
  /** Use the larger `hero` image instead of `img`. */
  useHero?: boolean;
  /** Override sizing — defaults to carousel-friendly dimensions. */
  className?: string;
};

/**
 * Vertical photo card with region/name/tagline overlay and a rating chip.
 * Used in horizontal carousels (home "Sugerencias locales"). For grid
 * tiles with a save heart, use `DestinationTile` instead.
 */
export function DestinationCard({
  destination: d,
  useHero,
  className,
}: DestinationCardProps) {
  return (
    <Link
      href={`/place/${d.id}`}
      className={cn(
        "relative block overflow-hidden rounded-3xl text-left ring-1 ring-white/10 shadow-[0_18px_36px_-20px_rgba(0,0,0,0.7)]",
        "h-[252px] w-[196px] shrink-0 transition-transform duration-150 active:scale-[0.98]",
        className,
      )}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={useHero ? d.hero : d.img}
        alt={d.name}
        className="h-full w-full object-cover"
      />
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent p-3 pt-10 text-white">
        <p className="text-[10px] font-medium uppercase tracking-wider text-white/80">
          {d.region}
        </p>
        <p className="mt-0.5 text-[15px] font-semibold leading-tight">
          {d.name}
        </p>
        <p className="mt-0.5 text-[11px] text-white/80">{d.tagline}</p>
      </div>
      <span className="absolute right-2.5 top-2.5 rounded-full bg-black/35 px-2 py-0.5 text-[10px] font-semibold text-white ring-1 ring-white/25 backdrop-blur">
        <span className="text-amber-300">★</span> {d.rating}
      </span>
      <span className="absolute left-2.5 top-2.5 rounded-full bg-black/35 px-2 py-0.5 text-[10px] font-semibold text-white ring-1 ring-white/25 backdrop-blur">
        Bs {d.priceFrom}
      </span>
    </Link>
  );
}
