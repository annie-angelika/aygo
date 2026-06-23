"use client";

import { LuImage } from "react-icons/lu";

import { cn } from "@/lib/utils";
import type { ThemeId } from "@/lib/create-event";

/**
 * The invite cover — a square card that previews the chosen theme (or a picked
 * image). A small button in the corner opens the image picker, mirroring Luma.
 */
export function CoverCard({
  theme,
  cover,
  onPickImage,
}: {
  theme: ThemeId;
  cover: string | null;
  onPickImage: () => void;
}) {
  return (
    <div className="relative mx-auto aspect-square w-full max-w-[300px] overflow-hidden rounded-3xl shadow-[0_24px_60px_-24px_rgba(0,0,0,0.6)]">
      {cover ? <ImageCover src={cover} /> : <ThemeCover theme={theme} />}

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
      <p className="absolute inset-0 grid place-items-center px-6 text-center text-[13px] font-medium uppercase tracking-[0.45em] text-white/70 mix-blend-overlay">
        You are invited
      </p>
    </>
  );
}

/** The themed "You Are Invited" card when no image has been chosen. */
function ThemeCover({ theme }: { theme: ThemeId }) {
  if (theme === "minimal") {
    return (
      <div className="absolute inset-0 grid place-items-center bg-white px-6">
        <p className="text-center font-serif text-[34px] font-bold leading-[1.05] tracking-tight text-neutral-900">
          You
          <br />
          Are
          <br />
          Invited
        </p>
      </div>
    );
  }

  if (theme === "quantum") {
    return (
      <div className="absolute inset-0 grid place-items-center bg-gradient-to-br from-sky-400 via-indigo-500 to-fuchsia-500 px-6">
        <p className="text-center text-[15px] font-semibold uppercase tracking-[0.4em] text-white drop-shadow">
          You are
          <br />
          invited
        </p>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 grid place-items-center overflow-hidden bg-indigo-950 px-6">
      <div
        aria-hidden
        className="absolute inset-0 opacity-60 [background:repeating-radial-gradient(circle_at_50%_120%,transparent_0,transparent_14px,rgba(139,92,246,0.5)_15px,transparent_16px)]"
      />
      <p
        className={cn(
          "relative text-center text-[15px] font-semibold uppercase tracking-[0.4em] text-violet-100 drop-shadow",
        )}
      >
        You are
        <br />
        invited
      </p>
    </div>
  );
}
