import Link from "next/link";
import type { Destination } from "@/types";
import { cn } from "@/lib/utils";

export type DestinationListItemProps = {
  destination: Destination;
  /** What to render on the right edge — defaults to a rating chip. */
  trailing?: React.ReactNode;
  className?: string;
};

/**
 * Horizontal compact row: thumb on the left, name + region/tagline in the
 * middle, optional trailing slot on the right (rating chip, chevron, etc.).
 * Linked to /place/[id] by default.
 */
export function DestinationListItem({
  destination: d,
  trailing,
  className,
}: DestinationListItemProps) {
  return (
    <Link
      href={`/place/${d.id}`}
      className={cn(
        "flex w-full items-center gap-3 rounded-2xl bg-white/80 p-2.5 text-left ring-1 ring-white backdrop-blur",
        className,
      )}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={d.img}
        alt={d.name}
        className="h-14 w-14 shrink-0 rounded-xl object-cover"
      />
      <div className="min-w-0 flex-1">
        <p className="truncate text-[14px] font-semibold text-slate-900">
          {d.name}
        </p>
        <p className="truncate text-[12px] text-slate-500">
          {d.region} · {d.tagline}
        </p>
      </div>
      {trailing ?? (
        <span className="rounded-full bg-slate-900 px-2 py-0.5 text-[10.5px] font-semibold text-white">
          ★ {d.rating}
        </span>
      )}
    </Link>
  );
}
