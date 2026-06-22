"use client";

import { useState } from "react";
import { LuHeart } from "react-icons/lu";

import { cn } from "@/lib/utils";

/** Heart a traveler's route stop — the core social action (no messaging). */
export function HeartButton({
  count,
  className,
}: {
  count: number;
  className?: string;
}) {
  const [liked, setLiked] = useState(false);
  const total = count + (liked ? 1 : 0);

  return (
    <button
      type="button"
      onClick={() => setLiked((l) => !l)}
      aria-pressed={liked}
      aria-label={liked ? "Remove heart" : "Heart this route"}
      className={cn(
        "flex w-9 flex-col items-center gap-0.5 text-muted-foreground transition-colors hover:text-rose-500",
        liked && "text-rose-500",
        className,
      )}
    >
      <LuHeart className={cn("size-5", liked && "fill-rose-500")} />
      <span className="text-[11px] font-medium tabular-nums">{total}</span>
    </button>
  );
}
