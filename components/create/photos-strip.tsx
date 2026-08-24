"use client";

import { LuPlus, LuX, LuStar } from "react-icons/lu";

import { MAX_IMAGES } from "@/lib/create-event";
import { cn } from "@/lib/utils";

/**
 * The event's photo gallery, editable: thumbnails in order (the first is the
 * cover), remove any, promote one to cover, add more up to the cap.
 */
export function PhotosStrip({
  images,
  onChange,
  onAdd,
}: {
  images: string[];
  onChange: (images: string[]) => void;
  onAdd: () => void;
}) {
  const full = images.length >= MAX_IMAGES;
  return (
    <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 py-1">
      {images.map((src, i) => (
        <div
          key={`${i}-${src.slice(0, 32)}`}
          className="group relative size-20 shrink-0 overflow-hidden rounded-xl ring-1 ring-border"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={src} alt="" className="size-full object-cover" />
          {i === 0 ? (
            <span className="absolute bottom-1 left-1 rounded-full bg-black/60 px-1.5 py-0.5 text-[9.5px] font-semibold text-white">
              Cover
            </span>
          ) : (
            <button
              type="button"
              aria-label="Use as cover"
              onClick={() => onChange([src, ...images.filter((_, j) => j !== i)])}
              className="absolute bottom-1 left-1 grid size-6 place-items-center rounded-full bg-black/60 text-white transition-colors hover:bg-amber-500"
            >
              <LuStar className="size-3" aria-hidden />
            </button>
          )}
          <button
            type="button"
            aria-label="Remove photo"
            onClick={() => onChange(images.filter((_, j) => j !== i))}
            className="absolute right-1 top-1 grid size-6 place-items-center rounded-full bg-black/60 text-white transition-colors hover:bg-destructive"
          >
            <LuX className="size-3" aria-hidden />
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={onAdd}
        disabled={full}
        className={cn(
          "flex size-20 shrink-0 flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-border bg-muted/50 text-muted-foreground transition-colors hover:bg-muted",
          full && "cursor-not-allowed opacity-50",
        )}
      >
        <LuPlus className="size-4" aria-hidden />
        <span className="text-[10.5px] font-medium">
          {full ? `Max ${MAX_IMAGES}` : `${images.length}/${MAX_IMAGES}`}
        </span>
      </button>
    </div>
  );
}
