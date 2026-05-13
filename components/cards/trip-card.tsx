import Link from "next/link";
import type { Destination } from "@/types";
import { cn } from "@/lib/utils";

export type TripCardProps = {
  destination: Destination;
  /** Free-form date label (e.g. "Hace 2 semanas", "Mar · 3 días"). */
  when: string;
  tags: string[];
  className?: string;
};

/**
 * Journal entry card: large hero photo, region · when, name, and a row of
 * tag chips. Stacked badges (review count + heart) sit on the top-right.
 */
export function TripCard({
  destination: d,
  when,
  tags,
  className,
}: TripCardProps) {
  return (
    <Link
      href={`/place/${d.id}`}
      className={cn(
        "relative block h-[160px] w-full overflow-hidden rounded-3xl text-left ring-1 ring-white/60 shadow-[0_8px_24px_-14px_rgba(15,23,42,0.3)]",
        className,
      )}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={d.hero} alt={d.name} className="h-full w-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/15 to-transparent" />

      <div className="absolute right-2.5 top-2.5 flex flex-col gap-1.5">
        <span className="grid size-8 place-items-center rounded-full bg-white/85 text-[10.5px] font-semibold text-slate-900">
          +{Math.floor(d.reviews / 100)}
        </span>
        <span className="grid size-8 place-items-center rounded-full bg-white/85 text-[10.5px] font-semibold text-rose-500">
          ♥
        </span>
      </div>

      <div className="absolute inset-x-3 bottom-3 text-white">
        <p className="text-[10.5px] font-medium uppercase tracking-wider text-white/80">
          {d.region} · {when}
        </p>
        <p className="text-[18px] font-semibold leading-tight">{d.name}</p>
        <div className="mt-1.5 flex flex-wrap gap-1.5">
          {tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-semibold capitalize backdrop-blur"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </Link>
  );
}
