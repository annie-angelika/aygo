"use client";

import { cn } from "@/lib/utils";
import type { Theme } from "@/lib/create-themes";

/**
 * A theme preview tile — the theme's background/pattern with a small event-card
 * skeleton floating on top (image block + two text lines), so each option reads
 * as "this is what a card looks like in this theme" rather than a flat color.
 * `detailed={false}` renders the tiny pill version (just a placeholder bar).
 */
export function ThemeSwatch({
  theme,
  className,
  detailed = true,
}: {
  theme: Theme;
  className?: string;
  detailed?: boolean;
}) {
  return (
    <div className={cn("relative overflow-hidden", theme.cover, className)}>
      {theme.id === "warp" && (
        <div
          aria-hidden
          className="absolute inset-0 opacity-60 [background:repeating-radial-gradient(circle_at_50%_120%,transparent_0,transparent_7px,rgba(139,92,246,0.5)_8px,transparent_9px)]"
        />
      )}

      {detailed ? (
        <div className="absolute inset-[9%] flex flex-col gap-[5%] rounded-lg bg-white/95 p-[7%] shadow-sm ring-1 ring-black/10">
          <div className="w-full flex-1 rounded-[4px] bg-neutral-300" />
          <div className="h-[5px] w-3/4 rounded-full bg-neutral-300" />
          <div className="h-[5px] w-1/2 rounded-full bg-neutral-200" />
        </div>
      ) : (
        <div className="absolute inset-[14%] flex flex-col justify-center gap-1 rounded bg-white/90 p-1 ring-1 ring-black/10">
          <div className="h-1 w-full rounded-full bg-neutral-300" />
          <div className="h-1 w-2/3 rounded-full bg-neutral-300" />
        </div>
      )}
    </div>
  );
}
