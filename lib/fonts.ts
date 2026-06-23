// Display fonts for the create-flow cover headline. Loaded via next/font so they
// self-host and ship only the weights we use. Each FONTS entry exposes a CSS
// `family` (a var() the cover applies inline) plus a label for the picker. Add a
// font by loading it here and pushing one entry — nothing else needs to change.
//
// Geist Sans / Geist Mono are already loaded in app/layout.tsx, so "Default" and
// "Mono" just reference those existing variables.

import {
  Playfair_Display,
  Bebas_Neue,
  Archivo_Black,
  Pacifico,
  DM_Serif_Display,
  Lora,
  Caveat,
  Space_Mono,
} from "next/font/google";

const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair" });
const bebas = Bebas_Neue({ subsets: ["latin"], weight: "400", variable: "--font-bebas" });
const archivo = Archivo_Black({ subsets: ["latin"], weight: "400", variable: "--font-archivo-black" });
const pacifico = Pacifico({ subsets: ["latin"], weight: "400", variable: "--font-pacifico" });
const dmSerif = DM_Serif_Display({ subsets: ["latin"], weight: "400", variable: "--font-dm-serif" });
const lora = Lora({ subsets: ["latin"], variable: "--font-lora" });
const caveat = Caveat({ subsets: ["latin"], variable: "--font-caveat" });
const spaceMono = Space_Mono({ subsets: ["latin"], weight: ["400", "700"], variable: "--font-space-mono" });

/** All font CSS-variable classes — applied once to the create screen wrapper. */
export const FONT_VARIABLES = [
  playfair.variable,
  bebas.variable,
  archivo.variable,
  pacifico.variable,
  dmSerif.variable,
  lora.variable,
  caveat.variable,
  spaceMono.variable,
].join(" ");

export type FontOption = { id: string; name: string; family: string };

export const FONTS: FontOption[] = [
  { id: "default", name: "Default", family: "var(--font-geist-sans), sans-serif" },
  { id: "playfair", name: "Playfair", family: "var(--font-playfair), serif" },
  { id: "dm-serif", name: "DM Serif", family: "var(--font-dm-serif), serif" },
  { id: "lora", name: "Lora", family: "var(--font-lora), serif" },
  { id: "bebas", name: "Bebas", family: "var(--font-bebas), sans-serif" },
  { id: "archivo", name: "Archivo", family: "var(--font-archivo-black), sans-serif" },
  { id: "mono", name: "Mono", family: "var(--font-geist-mono), monospace" },
  { id: "space-mono", name: "Space Mono", family: "var(--font-space-mono), monospace" },
  { id: "pacifico", name: "Pacifico", family: "var(--font-pacifico), cursive" },
  { id: "caveat", name: "Caveat", family: "var(--font-caveat), cursive" },
];

export function getFont(id: string): FontOption {
  return FONTS.find((f) => f.id === id) ?? FONTS[0];
}
