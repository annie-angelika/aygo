import { cn } from "@/lib/utils";

type Tone = "light" | "dark";

/** Base shimmer block. Compose with width/height utilities. */
export function Skeleton({
  tone = "light",
  className,
}: {
  tone?: Tone;
  className?: string;
}) {
  return (
    <div
      aria-hidden
      className={cn(
        "animate-pulse rounded-3xl",
        tone === "dark" ? "bg-white/10" : "bg-white/60",
        className,
      )}
    />
  );
}

export function SkeletonCarousel({
  count = 3,
  itemClassName = "h-[252px] w-[196px]",
  tone = "light",
  className,
}: {
  count?: number;
  itemClassName?: string;
  tone?: Tone;
  className?: string;
}) {
  return (
    <div
      className={cn("-mx-5 flex gap-3 overflow-hidden px-5", className)}
    >
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton key={i} tone={tone} className={cn("shrink-0", itemClassName)} />
      ))}
    </div>
  );
}

export function SkeletonList({
  count = 3,
  itemClassName = "h-[64px] rounded-2xl",
  tone = "light",
  className,
}: {
  count?: number;
  itemClassName?: string;
  tone?: Tone;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-2.5", className)}>
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton key={i} tone={tone} className={itemClassName} />
      ))}
    </div>
  );
}

export function SkeletonGrid({
  count = 4,
  itemClassName = "h-[180px]",
  className,
}: {
  count?: number;
  itemClassName?: string;
  className?: string;
}) {
  return (
    <div className={cn("grid grid-cols-2 gap-3", className)}>
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton key={i} className={itemClassName} />
      ))}
    </div>
  );
}
