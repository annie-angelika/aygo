"use client";

import { useState } from "react";

import { ThemeCover } from "@/components/event/theme-cover";
import { cn } from "@/lib/utils";
import type { AygoEvent } from "@/types";

/**
 * The event's photos as the detail banner: one photo framed 4:3 with the
 * host's focal point; several become a swipeable, snap-scrolling strip with
 * dots. No library — native scroll-snap + a scroll listener for the dots.
 * A navy-to-cream wash fades the photo into the page.
 *
 * `wide` is the event page's desktop treatment: from `lg` the strip becomes a
 * fixed-height rounded card with no wash. Leave it off inside the phone-width
 * preview sheet, where the viewport breakpoint would fire but the frame is narrow.
 */
export function EventGallery({
  event,
  wide = false,
}: {
  event: AygoEvent;
  wide?: boolean;
}) {
  const images = event.images?.length ? event.images : event.cover ? [event.cover] : [];
  const [index, setIndex] = useState(0);

  function onScroll(e: React.UIEvent<HTMLDivElement>) {
    const el = e.currentTarget;
    setIndex(Math.round(el.scrollLeft / el.clientWidth));
  }

  return (
    <div
      className={cn(
        "relative aspect-[4/3] w-full",
        wide && "lg:aspect-auto lg:h-[420px] lg:overflow-hidden lg:rounded-3xl lg:ring-1 lg:ring-border",
      )}
    >
      {images.length === 0 && (
        <ThemeCover theme={event.theme} className="aspect-auto size-full" />
      )}
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
      <div
        className={cn(
          "pointer-events-none absolute inset-0 bg-gradient-to-b from-navy/35 via-transparent via-40% to-background",
          wide && "lg:hidden",
        )}
      />
      {images.length > 1 && (
        <div
          className={cn(
            "pointer-events-none absolute right-3 top-14 flex gap-1.5 rounded-full bg-navy/50 px-2 py-1.5 backdrop-blur",
            wide && "lg:top-3",
          )}
          aria-hidden
        >
          {images.map((_, i) => (
            <span
              key={i}
              className={cn(
                "size-1.5 rounded-full transition-colors",
                i === index ? "bg-gold" : "bg-cream/50",
              )}
            />
          ))}
        </div>
      )}
    </div>
  );
}
