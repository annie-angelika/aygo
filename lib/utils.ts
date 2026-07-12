import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Treat legacy stock-photo (Picsum) avatars as "no photo" — older builds baked
 * them into saved profiles and registration snapshots. Real avatars are Pollar
 * URLs or data: uploads.
 */
export function realAvatar(src?: string): string | undefined {
  return src && !src.includes("picsum.photos") ? src : undefined
}

/**
 * Normalize a city name for matching ("Santa cruz " ↔ "Santa Cruz"), so an
 * admin's or host's casing never hides an event from its city page or counts.
 */
export function cityKey(name: string): string {
  return name.trim().toLowerCase()
}

/** "Ana María Rojas" → "AM" — the avatar fallback when there's no photo. */
export function initials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase()
}
