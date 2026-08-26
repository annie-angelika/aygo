// Display fonts for the create-flow cover headline. Loaded via next/font so they
// self-host and ship only the weights we use. Each FONTS entry exposes a CSS
// `family` (a var() the cover applies inline) plus a label. A theme picks its
// font by id (lib/create-themes); add a font by loading it here and pushing
// one entry — nothing else needs to change.
//
// Geist Sans / Geist Mono are already loaded in app/layout.tsx, so "Default" and
// "Mono" just reference those existing variables.

import {
  Playfair_Display,
  Pacifico,
  DM_Serif_Display,
  Lora,
  Space_Mono,
} from "next/font/google";

// Only fonts a theme in lib/create-themes actually uses are loaded — every
// entry here costs a download on the create screen.
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair" });
const pacifico = Pacifico({ subsets: ["latin"], weight: "400", variable: "--font-pacifico" });
const dmSerif = DM_Serif_Display({ subsets: ["latin"], weight: "400", variable: "--font-dm-serif" });
const lora = Lora({ subsets: ["latin"], variable: "--font-lora" });
const spaceMono = Space_Mono({ subsets: ["latin"], weight: ["400", "700"], variable: "--font-space-mono" });

/** All font CSS-variable classes — applied once to the create screen wrapper. */
export const FONT_VARIABLES = [
  playfair.variable,
  pacifico.variable,
  dmSerif.variable,
  lora.variable,
  spaceMono.variable,
].join(" ");

export type FontOption = { id: string; name: string; family: string };

export const FONTS: FontOption[] = [
  { id: "default", name: "Default", family: "var(--font-geist-sans), sans-serif" },
  { id: "playfair", name: "Playfair", family: "var(--font-playfair), serif" },
  { id: "dm-serif", name: "DM Serif", family: "var(--font-dm-serif), serif" },
  { id: "lora", name: "Lora", family: "var(--font-lora), serif" },
  { id: "mono", name: "Mono", family: "var(--font-geist-mono), monospace" },
  { id: "space-mono", name: "Space Mono", family: "var(--font-space-mono), monospace" },
  { id: "pacifico", name: "Pacifico", family: "var(--font-pacifico), cursive" },
];

export function getFont(id: string): FontOption {
  return FONTS.find((f) => f.id === id) ?? FONTS[0];
}
