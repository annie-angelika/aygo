"use client";

import { LuImage } from "react-icons/lu";

import { getTheme, getStyle } from "@/lib/create-themes";
import { getFont } from "@/lib/fonts";
import { cn } from "@/lib/utils";

/**
 * The invite cover — a square card that previews the chosen theme, font and
 * style (or a picked image). All themed looks render through this one path
 * (see lib/create-themes + lib/fonts). A subtle ring keeps the card legible even
 * when its surface is close to the page color. A corner button opens the picker.
 */
export function CoverCard({
  themeId,
  fontId,
  styleId,
  cover,
  onPickImage,
}: {
  themeId: string;
  fontId: string;
  styleId: string;
  cover: string | null;
  onPickImage: () => void;
}) {
  const theme = getTheme(themeId);

  return (
    <div className="relative mx-auto aspect-square w-full max-w-[300px] overflow-hidden rounded-3xl ring-1 ring-black/10 shadow-[0_24px_60px_-24px_rgba(0,0,0,0.55)] dark:ring-white/15">
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
            className={cn("relative text-center", theme.title, getStyle(styleId).className)}
            style={{ fontFamily: getFont(fontId).family }}
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

/** A picked image, with the faint "you are invited" watermark Luma keeps on top. */
function ImageCover({ src }: { src: string }) {
  return (
    <>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt="" className="absolute inset-0 size-full object-cover" />
      <div className="absolute inset-0 bg-black/10" />
      <p className="absolute inset-0 grid place-items-center px-6 text-center text-[13px] font-medium uppercase tracking-[0.45em] text-white/75 mix-blend-overlay">
        You are invited
      </p>
    </>
  );
}
