"use client";

import { useRef, useState } from "react";
import { LuImage, LuMove } from "react-icons/lu";

import { getTheme, getStyle } from "@/lib/create-themes";
import { getFont } from "@/lib/fonts";
import { cn } from "@/lib/utils";

/**
 * The invite cover. With no photo it's the theme's square "You Are Invited"
 * card; with one it's the photo at the same 4:3 frame the event page uses, so
 * what you see here is what guests see. Drag the photo to choose its focal
 * point (stored as a CSS object-position) — nothing is ever cropped away in
 * data, only framed.
 */
export function CoverCard({
  themeId,
  cover,
  position = "50% 50%",
  onPickImage,
  onPosition,
}: {
  themeId: string;
  cover: string | null;
  position?: string;
  onPickImage: () => void;
  onPosition?: (position: string) => void;
}) {
  const theme = getTheme(themeId);

  return (
    <div
      className={cn(
        "relative mx-auto w-full overflow-hidden rounded-3xl ring-1 ring-black/10 dark:ring-white/15",
        cover ? "aspect-[4/3]" : "aspect-square max-w-[300px]",
      )}
    >
      {cover ? (
        <Positioner src={cover} position={position} onPosition={onPosition} />
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

/** The photo, draggable to set its focal point. */
function Positioner({
  src,
  position,
  onPosition,
}: {
  src: string;
  position: string;
  onPosition?: (position: string) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const drag = useRef<{ x: number; y: number; px: number; py: number } | null>(null);
  const [dragging, setDragging] = useState(false);
  const [px, py] = position.split(" ").map((v) => parseFloat(v));

  function onPointerDown(e: React.PointerEvent) {
    if (!onPosition) return;
    drag.current = { x: e.clientX, y: e.clientY, px, py };
    setDragging(true);
    e.currentTarget.setPointerCapture(e.pointerId);
  }
  function onPointerMove(e: React.PointerEvent) {
    const d = drag.current;
    const box = ref.current?.getBoundingClientRect();
    if (!d || !box || !onPosition) return;
    // Dragging the photo right reveals its left side → position decreases.
    const nx = Math.min(100, Math.max(0, d.px - ((e.clientX - d.x) / box.width) * 100));
    const ny = Math.min(100, Math.max(0, d.py - ((e.clientY - d.y) / box.height) * 100));
    onPosition(`${Math.round(nx)}% ${Math.round(ny)}%`);
  }
  function onPointerUp() {
    drag.current = null;
    setDragging(false);
  }

  return (
    <div
      ref={ref}
      className={cn("absolute inset-0 touch-none select-none", onPosition && (dragging ? "cursor-grabbing" : "cursor-grab"))}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt=""
        draggable={false}
        className="size-full object-cover"
        style={{ objectPosition: position }}
      />
      {onPosition && (
        <span className="pointer-events-none absolute bottom-3 left-3 inline-flex items-center gap-1 rounded-full bg-black/55 px-2.5 py-1 text-[11px] font-medium text-white backdrop-blur">
          <LuMove className="size-3" aria-hidden />
          Drag to reposition
        </span>
      )}
    </div>
  );
}
