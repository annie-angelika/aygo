import { AygoArt } from "@/components/passport/aygo-art";
import { AygoStar, MarkLaPaz } from "@/components/ui/brand-icons";
import { CATEGORY_META } from "@/lib/events-data";
import { cn } from "@/lib/utils";
import type { Stamp } from "@/types";

/**
 * A collected aygo as a square postage stamp: white matte, the artwork inside a
 * thin gold hairline, a navy strip with the city mark and the date, and the gold
 * star seal overlapping the top-right corner. Fills its (square-ish) parent —
 * size it by width. `lg` is the big version for the detail and success states.
 */
const SIZES = {
  sm: {
    matte: "rounded-md p-1.5 -outline-offset-4",
    art: "rounded-[3px]",
    strip: "inset-x-1.5 bottom-1.5 h-[18px] pl-1 pr-1.5 text-[8.5px] tracking-[0.06em]",
    mark: "size-3",
    seal: "-right-2 -top-2 size-6 ring-2",
    star: "size-[13px]",
    icon: "size-7",
  },
  lg: {
    matte: "rounded-lg p-2 -outline-offset-6",
    art: "rounded-[4px]",
    strip: "inset-x-2 bottom-2 h-[26px] pl-1.5 pr-2 text-[10px] tracking-[0.08em]",
    mark: "size-4",
    seal: "-right-3.5 -top-3.5 size-9 ring-[3px]",
    star: "size-5",
    icon: "size-12",
  },
} as const;

/** "Jun 21" from the backend's earn date, or nothing when there isn't one. */
export function stampDate(stamp: Stamp): string | undefined {
  if (!stamp.earnedAt) return;
  const d = new Date(stamp.earnedAt);
  if (Number.isNaN(d.getTime())) return;
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}

export function AygoStamp({
  stamp,
  dateLabel,
  size = "sm",
  onDark,
  className,
}: {
  stamp: Stamp;
  /** Fallback for the strip when the aygo has no earn date (e.g. its month). */
  dateLabel?: string;
  size?: keyof typeof SIZES;
  /** Rings the seal in navy so it sits on a navy surface. */
  onDark?: boolean;
  className?: string;
}) {
  const s = SIZES[size];
  const { Icon } = CATEGORY_META[stamp.category];
  const date = stampDate(stamp) ?? dateLabel;

  return (
    <span
      className={cn(
        "relative block aspect-square w-full bg-white shadow-[0_1px_2px_rgba(9,25,53,0.12),0_8px_16px_-12px_rgba(9,25,53,0.4)] outline outline-1 outline-gold/75",
        s.matte,
        className,
      )}
    >
      <span className={cn("relative block size-full overflow-hidden", s.art)}>
        <AygoArt
          image={stamp.image}
          blurDataURL={stamp.blurDataURL}
          alt=""
          sizes={size === "lg" ? "168px" : "(max-width: 480px) 30vw, 120px"}
          quality={size === "lg" ? undefined : 45}
          fallback={
            <span className="grid size-full place-items-center bg-secondary text-foreground">
              <Icon className={s.icon} aria-hidden />
            </span>
          }
        />
      </span>

      <span
        className={cn(
          "absolute flex items-center justify-between bg-navy/85 font-bold uppercase text-gold",
          s.strip,
        )}
      >
        <MarkLaPaz className={cn("text-cream", s.mark)} />
        {date && <span className="truncate">{date}</span>}
      </span>

      <span
        aria-hidden
        className={cn(
          "absolute grid place-items-center rounded-full bg-gold text-navy",
          onDark ? "ring-navy" : "ring-background",
          s.seal,
        )}
      >
        <AygoStar className={s.star} />
      </span>
    </span>
  );
}
