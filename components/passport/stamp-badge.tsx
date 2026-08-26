import { AygoStamp } from "@/components/passport/aygo-stamp";
import { cn } from "@/lib/utils";
import type { Stamp } from "@/types";

/** One stamp in a wall — the square tile plus its title; tappable when `onSelect` is set. */
export function StampBadge({
  stamp,
  dateLabel,
  onSelect,
}: {
  stamp: Stamp;
  dateLabel?: string;
  onSelect?: (stamp: Stamp) => void;
}) {
  const tile = (
    <span
      className={cn(
        "relative block w-full transition-transform duration-200",
        onSelect && "hover:-translate-y-0.5",
      )}
    >
      <AygoStamp stamp={stamp} dateLabel={dateLabel} />
    </span>
  );

  return (
    <div className="flex flex-col items-center gap-2">
      {onSelect ? (
        <button
          type="button"
          onClick={() => onSelect(stamp)}
          aria-label={stamp.title}
          className="w-full"
        >
          {tile}
        </button>
      ) : (
        tile
      )}
      <span className="line-clamp-2 text-center text-[11.5px] font-semibold leading-tight text-foreground">
        {stamp.title}
      </span>
    </div>
  );
}
