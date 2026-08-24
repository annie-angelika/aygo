"use client";

import { useState } from "react";

import { cn } from "@/lib/utils";
import type { AygoEvent } from "@/types";

/**
 * The event's photos as the detail banner: one photo framed 4:3 with the
 * host's focal point; several become a swipeable, snap-scrolling strip with
 * dots. No library — native scroll-snap + a scroll listener for the dots.
 */
export function EventGallery({ event }: { event: AygoEvent }) {
  const images = event.images?.length ? event.images : [event.cover];
  const [index, setIndex] = useState(0);

  function onScroll(e: React.UIEvent<HTMLDivElement>) {
    const el = e.currentTarget;
    setIndex(Math.round(el.scrollLeft / el.clientWidth));
  }

  return (
    <div className="relative aspect-[4/3] w-full">
      <div
        className="no-scrollbar flex size-full snap-x snap-mandatory overflow-x-auto"
        onScroll={images.length > 1 ? onScroll : undefined}
      >
        {images.map((src, i) => (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            key={`${i}-${src.slice(0, 32)}`}
            src={src}
            alt={i === 0 ? "" : `Photo ${i + 1} of ${images.length}`}
            className="size-full shrink-0 snap-center object-cover"
            style={i === 0 && event.coverPosition ? { objectPosition: event.coverPosition } : undefined}
            loading={i === 0 ? "eager" : "lazy"}
          />
        ))}
      </div>
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/25 via-transparent to-background" />
      {images.length > 1 && (
        <div className="pointer-events-none absolute right-3 top-14 flex gap-1.5 rounded-full bg-black/45 px-2 py-1.5 backdrop-blur" aria-hidden>
          {images.map((_, i) => (
            <span
              key={i}
              className={cn(
                "size-1.5 rounded-full transition-colors",
                i === index ? "bg-white" : "bg-white/50",
              )}
            />
          ))}
        </div>
      )}
    </div>
  );
}
