"use client";

import { LuPlus, LuX } from "react-icons/lu";

import { MAX_IMAGES } from "@/lib/create-event";
import { cn } from "@/lib/utils";

/**
 * The event's photos as a row of thumbnails under the cover: the first one is
 * the cover, tap any to make it the cover, × removes it, + adds more (up to
 * MAX_IMAGES — the event page shows them as a swipeable gallery). Hidden
 * entirely while there are no photos; the cover card's own button adds the
 * first one.
 */
export function PhotoStrip({
  images,
  onChange,
  onAdd,
  className,
}: {
  images: string[];
  onChange: (images: string[]) => void;
  onAdd: () => void;
  className?: string;
}) {
  if (images.length === 0) return null;
  const remaining = MAX_IMAGES - images.length;

  return (
    <div className={cn("flex items-center gap-2 overflow-x-auto py-0.5", className)}>
      {images.map((src, i) => (
        <div key={`${i}-${src.slice(-24)}`} className="relative shrink-0">
          <button
            type="button"
            onClick={() => onChange([src, ...images.filter((_, j) => j !== i)])}
            aria-label={i === 0 ? "Cover photo" : `Make photo ${i + 1} the cover`}
            className={cn(
              "block size-14 overflow-hidden rounded-xl ring-2 transition-colors",
              i === 0 ? "ring-gold" : "ring-transparent hover:ring-border",
            )}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={src} alt="" className="size-full object-cover" />
          </button>
          <button
            type="button"
            onClick={() => onChange(images.filter((_, j) => j !== i))}
            aria-label={`Remove photo ${i + 1}`}
            className="absolute -right-1.5 -top-1.5 grid size-5 place-items-center rounded-full bg-black/70 text-white ring-2 ring-background"
          >
            <LuX className="size-3" aria-hidden />
          </button>
        </div>
      ))}
      {remaining > 0 && (
        <button
          type="button"
          onClick={onAdd}
          aria-label="Add a photo"
          className="grid size-14 shrink-0 place-items-center rounded-xl border border-dashed border-border bg-card text-muted-foreground transition-colors hover:bg-secondary/60"
        >
          <LuPlus className="size-4" aria-hidden />
        </button>
      )}
    </div>
  );
}
