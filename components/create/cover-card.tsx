"use client";

import { LuImage } from "react-icons/lu";

import { getTheme, getStyle } from "@/lib/create-themes";
import { getFont } from "@/lib/fonts";
import { cn } from "@/lib/utils";

/**
 * The invite cover — a square card that previews the chosen theme (or a picked
 * image). The headline uses the theme's own signature font + style (the Font/
 * Style pickers style the event description, not this artwork). A subtle ring
 * keeps the card legible; a corner button opens the image picker.
 */
export function CoverCard({
  themeId,
  cover,
  onPickImage,
}: {
  themeId: string;
  cover: string | null;
  onPickImage: () => void;
}) {
  const theme = getTheme(themeId);

  return (
    <div className="relative mx-auto aspect-square w-full max-w-[300px] overflow-hidden rounded-3xl ring-1 ring-black/10 dark:ring-white/15">
      {cover ? (
        <ImageCover src={cover} />
      ) : (
        <div className={cn("absolute inset-0 grid place-items-center px-6", theme.cover)}>
          {theme.id === "warp" && (
            <div
              aria-hidden
              className="absolute inset-0 opacity-60 [background:repeating-radial-gradient(circle_at_50%_120%,transparent_0,transparent_14px,rgba(139,92,246,0.5)_15px,transparent_16px)]"
            />
          )}
          <p
            className={cn("relative text-center", theme.title, getStyle(theme.style).className)}
            style={{ fontFamily: getFont(theme.font).family }}
          >
            You
            <br />
            Are
            <br />
            Invited
          </p>
        </div>
      )}

      <button
        type="button"
        onClick={onPickImage}
        aria-label="Choose cover image"
        className="absolute bottom-3 right-3 grid size-9 place-items-center rounded-full bg-black/55 text-white backdrop-blur transition-colors hover:bg-black/70"
      >
        <LuImage className="size-4" aria-hidden />
      </button>
    </div>
  );
}

/** A picked image — shown on its own, no watermark. */
function ImageCover({ src }: { src: string }) {
  return (
    /* eslint-disable-next-line @next/next/no-img-element */
    <img src={src} alt="" className="absolute inset-0 size-full object-cover" />
  );
}
