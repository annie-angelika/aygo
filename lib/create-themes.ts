// Cover themes for the create flow. Each theme is a self-contained descriptor —
// the page ambient, the invite-card surface, the headline color/size, and the
// default font + style — so the cover renders generically (no per-theme JSX) and
// adding a theme is just one more entry. Font (lib/fonts) and Style (below) are
// independently overridable in the picker; a theme just sets sensible defaults.
// Class strings are literal so Tailwind keeps them.

export type ThemeTone = "light" | "dark";

export type Theme = {
  id: string;
  name: string;
  /** Default light/dark; the Display toggle can override it per draft. */
  tone: ThemeTone;
  /** Swatch in the theme picker. */
  swatch: string;
  /** Ambient background for the whole create page (behind the nav). */
  page: string;
  /** The invite-card surface. */
  cover: string;
  /** Headline color + size + leading only (font + casing live elsewhere). */
  title: string;
  /** Default font id (see lib/fonts). */
  font: string;
  /** Default style id (see STYLES). */
  style: string;
};

/** Headline casing / tracking / slant options — the "Style" list. */
export const STYLES: { id: string; name: string; className: string }[] = [
  { id: "normal", name: "Normal", className: "" },
  { id: "tight", name: "Tight", className: "tracking-tight" },
  { id: "uppercase", name: "Uppercase", className: "uppercase tracking-[0.25em]" },
  { id: "wide", name: "Wide", className: "uppercase tracking-[0.4em]" },
  { id: "italic", name: "Italic", className: "italic" },
  { id: "lowercase", name: "Lowercase", className: "lowercase tracking-tight" },
];

export function getStyle(id: string) {
  return STYLES.find((s) => s.id === id) ?? STYLES[0];
}

export const THEMES: Theme[] = [
  {
    // The brand's own: navy ink, a gold star, cream type. The page stays cream
    // so the navy top bar reads against it.
    id: "aygo", name: "aygo", tone: "light", swatch: "bg-navy",
    page: "bg-background", cover: "bg-navy",
    title: "text-[32px] font-bold leading-[1.1] tracking-[-0.03em] text-cream", font: "default", style: "tight",
  },
  {
    id: "minimal", name: "Minimal", tone: "light", swatch: "bg-neutral-100",
    page: "bg-[#f4f1ea]", cover: "bg-white",
    title: "text-[34px] font-bold leading-[1.05] text-neutral-900", font: "playfair", style: "tight",
  },
  {
    id: "mono", name: "Mono", tone: "dark", swatch: "bg-zinc-900",
    page: "bg-zinc-950", cover: "bg-zinc-900",
    title: "text-[20px] font-medium leading-[2] text-white", font: "mono", style: "wide",
  },
  {
    id: "neon", name: "Neon", tone: "dark", swatch: "bg-gradient-to-br from-emerald-400 to-emerald-700",
    page: "bg-[#04140e]", cover: "bg-[#071c14]",
    title: "text-[26px] font-semibold leading-[1.15] text-emerald-300 [text-shadow:0_0_18px_rgba(52,211,153,0.7)]",
    font: "space-mono", style: "lowercase",
  },
  {
    id: "quantum", name: "Quantum", tone: "dark", swatch: "bg-gradient-to-br from-sky-400 to-fuchsia-500",
    page: "bg-indigo-950", cover: "bg-gradient-to-br from-sky-400 via-indigo-500 to-fuchsia-500",
    title: "text-[16px] font-semibold leading-[1.8] text-white drop-shadow", font: "default", style: "wide",
  },
  {
    id: "warp", name: "Warp", tone: "dark", swatch: "bg-gradient-to-br from-violet-700 to-indigo-950",
    page: "bg-[#0b0820]", cover: "bg-indigo-950",
    title: "text-[16px] font-semibold leading-[1.8] text-violet-100 drop-shadow", font: "default", style: "wide",
  },
  {
    id: "sunset", name: "Sunset", tone: "dark", swatch: "bg-gradient-to-br from-orange-400 to-rose-600",
    page: "bg-[#1a0a0f]", cover: "bg-gradient-to-br from-orange-400 via-rose-500 to-purple-600",
    title: "text-[30px] font-semibold leading-[1.1] text-white drop-shadow", font: "dm-serif", style: "italic",
  },
  {
    id: "paper", name: "Paper", tone: "light", swatch: "bg-stone-200",
    page: "bg-stone-100", cover: "bg-stone-50",
    title: "text-[22px] font-semibold leading-[1.6] text-stone-800", font: "lora", style: "uppercase",
  },
  {
    id: "ocean", name: "Ocean", tone: "dark", swatch: "bg-gradient-to-br from-cyan-400 to-blue-700",
    page: "bg-[#04121f]", cover: "bg-gradient-to-br from-cyan-400 via-sky-500 to-blue-700",
    title: "text-[18px] font-light leading-[1.7] text-white", font: "default", style: "wide",
  },
  {
    id: "blossom", name: "Blossom", tone: "light", swatch: "bg-gradient-to-br from-rose-200 to-pink-400",
    page: "bg-[#fbeef3]", cover: "bg-gradient-to-br from-rose-100 to-pink-200",
    title: "text-[30px] font-semibold leading-[1.1] text-rose-700", font: "pacifico", style: "normal",
  },
  {
    id: "midnight", name: "Midnight", tone: "dark", swatch: "bg-slate-800",
    page: "bg-slate-950", cover: "bg-slate-900",
    title: "text-[18px] font-medium leading-[1.7] text-slate-100", font: "default", style: "uppercase",
  },
];

export type ThemeId = (typeof THEMES)[number]["id"];

export const DEFAULT_THEME_ID: ThemeId = "aygo";

export function getTheme(id: string): Theme {
  return THEMES.find((t) => t.id === id) ?? THEMES[0];
}
