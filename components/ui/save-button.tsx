"use client";

import { useSavedPlaces } from "@/hooks/use-saved-places";
import { HeartIcon } from "@/components/ui/icons";
import { cn } from "@/lib/utils";

export type SaveButtonProps = {
  destinationId: string;
  /** sm fits inside card corners; md fits a header bar. */
  size?: "sm" | "md";
  /** `light` for white-ish backgrounds, `glass` for on-photo overlays. */
  variant?: "light" | "glass";
  className?: string;
};

const SIZE: Record<NonNullable<SaveButtonProps["size"]>, string> = {
  sm: "size-7",
  md: "size-10",
};

const VARIANT_UNSAVED: Record<NonNullable<SaveButtonProps["variant"]>, string> = {
  light: "bg-white/90 text-slate-900",
  glass: "bg-white/20 text-white backdrop-blur",
};

/**
 * Heart toggle that reads & writes through `useSavedPlaces`. Use this
 * inside or on top of a card; it stops propagation so wrapping links
 * don't navigate when the heart is clicked.
 */
export function SaveButton({
  destinationId,
  size = "sm",
  variant = "light",
  className,
}: SaveButtonProps) {
  const { isSaved, toggle, hydrated } = useSavedPlaces();
  const saved = hydrated && isSaved(destinationId);

  return (
    <button
      type="button"
      aria-label={saved ? "Quitar de guardados" : "Guardar"}
      aria-pressed={saved}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggle(destinationId);
      }}
      className={cn(
        "grid place-items-center rounded-full transition-colors",
        SIZE[size],
        saved ? "bg-rose-500 text-white" : VARIANT_UNSAVED[variant],
        className,
      )}
    >
      <HeartIcon filled={saved} />
    </button>
  );
}
