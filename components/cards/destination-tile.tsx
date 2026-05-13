import Link from "next/link";
import type { Destination } from "@/types";
import { SaveButton } from "@/components/ui/save-button";
import { cn } from "@/lib/utils";

export type DestinationTileProps = {
  destination: Destination;
  className?: string;
};

/**
 * Grid-friendly destination tile with a save heart on top. The Link wraps
 * only the image+caption — the save button sits as a sibling so we never
 * nest `<a>` and `<button>` (invalid HTML).
 */
export function DestinationTile({
  destination: d,
  className,
}: DestinationTileProps) {
  return (
    <div className={cn("relative", className)}>
      <Link
        href={`/place/${d.id}`}
        className="relative block h-[180px] w-full overflow-hidden rounded-3xl text-left ring-1 ring-white/60 shadow-[0_8px_24px_-12px_rgba(15,23,42,0.25)]"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={d.img}
          alt={d.name}
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/15 to-transparent" />
        <div className="absolute inset-x-3 bottom-2.5 text-white">
          <p className="text-[10px] font-medium uppercase tracking-wider text-white/80">
            {d.region}
          </p>
          <p className="text-[13.5px] font-semibold leading-tight">{d.name}</p>
        </div>
      </Link>
      <SaveButton
        destinationId={d.id}
        className="absolute right-2.5 top-2.5 z-10"
      />
    </div>
  );
}
