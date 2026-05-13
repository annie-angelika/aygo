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
        "relative block overflow-hidden rounded-3xl text-left ring-1 ring-white/60 shadow-[0_8px_24px_-12px_rgba(15,23,42,0.25)]",
        "h-[230px] w-[180px] shrink-0",
        className,
      )}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={useHero ? d.hero : d.img}
        alt={d.name}
        className="h-full w-full object-cover"
      />
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent p-3 pt-10 text-white">
        <p className="text-[10px] font-medium uppercase tracking-wider text-white/80">
          {d.region}
        </p>
        <p className="mt-0.5 text-[15px] font-semibold leading-tight">
          {d.name}
        </p>
        <p className="mt-0.5 text-[11px] text-white/80">{d.tagline}</p>
      </div>
      <span className="absolute right-2.5 top-2.5 rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-semibold text-slate-900">
        ★ {d.rating}
      </span>
    </Link>
  );
}
