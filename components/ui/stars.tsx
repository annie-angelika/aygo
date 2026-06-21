import { LuStar } from "react-icons/lu";

import { cn } from "@/lib/utils";

/** Read-only 5-star rating. Rounds to the nearest whole star. */
export function Stars({
  value,
  className,
}: {
  value: number;
  className?: string;
}) {
  const filled = Math.round(value);
  return (
    <div
      className={cn("flex items-center gap-0.5", className)}
      role="img"
      aria-label={`${value} out of 5`}
    >
      {[1, 2, 3, 4, 5].map((i) => (
        <LuStar
          key={i}
          className={cn(
            "size-3.5",
            i <= filled
              ? "fill-amber-400 text-amber-400"
              : "fill-muted text-muted",
          )}
          aria-hidden
        />
      ))}
    </div>
  );
}
