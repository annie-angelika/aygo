import { LuCat, LuStar } from "react-icons/lu";

import { cn } from "@/lib/utils";

/**
 * A playful rainbow-cat banner (Nyan-cat vibe) recreated in CSS — a little cat
 * flying across a starry sky trailing a streaming rainbow. Lightweight and
 * looping, so it reads "alive" like a gif without shipping one. Respects
 * reduced-motion (the trail and bob simply hold still).
 */

// Faint twinkling stars scattered over the sky.
const STARS = [
  "left-6 top-5 size-3 [animation-delay:-0.2s]",
  "left-[38%] top-7 size-2.5 [animation-delay:-0.9s]",
  "right-10 top-4 size-3.5 [animation-delay:-1.4s]",
  "right-5 bottom-6 size-2.5 [animation-delay:-0.6s]",
  "left-[28%] bottom-5 size-2 [animation-delay:-1.1s]",
] as const;

export function CollectionBanner({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "relative h-32 overflow-hidden bg-gradient-to-b from-indigo-400 via-violet-400 to-sky-300",
        className,
      )}
    >
      {STARS.map((spot) => (
        <LuStar
          key={spot}
          aria-hidden
          className={cn(
            "absolute fill-white/80 text-white/80 animate-pulse motion-reduce:animate-none",
            spot,
          )}
        />
      ))}

      {/* The rainbow trail, streaming in from off-screen behind the cat. */}
      <div className="absolute left-0 top-1/2 h-14 w-[68%] -translate-y-1/2 overflow-hidden rounded-r-md shadow-[0_6px_16px_-8px_rgba(15,23,42,0.5)]">
        <div className="size-full bg-[linear-gradient(to_bottom,#ff5a5f_0_16.66%,#ff924c_16.66%_33.33%,#ffca3a_33.33%_50%,#8ac926_50%_66.66%,#1982c4_66.66%_83.33%,#6a4c93_83.33%_100%)]" />
        {/* Scrolling speed-lines for the sense of motion. */}
        <div className="absolute inset-0 bg-[repeating-linear-gradient(90deg,rgba(255,255,255,0.35)_0_11px,transparent_11px_22px)] animate-[aygo-stream_0.5s_linear_infinite] motion-reduce:animate-none" />
      </div>

      {/* The cat, riding the leading edge of the trail and gently bobbing. */}
      <div className="absolute left-[60%] top-1/2 -translate-y-1/2 animate-[aygo-float_1.6s_ease-in-out_infinite] motion-reduce:animate-none">
        <span className="grid size-14 place-items-center rounded-2xl bg-pink-200 text-slate-800 shadow-md ring-2 ring-white/70">
          <LuCat className="size-8" aria-hidden />
        </span>
      </div>
    </div>
  );
}
