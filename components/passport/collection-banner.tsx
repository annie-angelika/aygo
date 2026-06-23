import {
  LuMountainSnow,
  LuSun,
  LuLandmark,
  LuTrees,
  LuCloud,
  LuStar,
  LuSparkles,
  LuLeaf,
} from "react-icons/lu";
import type { IconType } from "react-icons";

import { cn } from "@/lib/utils";

/**
 * A calm, looping decorative scene that sits at the top of your collection and
 * shifts with where you are — a lightweight stand-in for a gif (drifting marks
 * + a slow gradient sheen, CSS-only). Themes are keyed by city, with a generic
 * fallback so any location still reads alive.
 */
type BannerTheme = {
  /** Layered gradient that slowly pans (the "sheen"). */
  gradient: string;
  /** Decorative marks that drift over the scene. */
  marks: IconType[];
};

const THEMES: Record<string, BannerTheme> = {
  "la paz": {
    gradient: "from-violet-500 via-indigo-500 to-sky-400",
    marks: [LuMountainSnow, LuCloud, LuStar],
  },
  cochabamba: {
    gradient: "from-amber-400 via-orange-500 to-rose-400",
    marks: [LuSun, LuLeaf, LuCloud],
  },
  sucre: {
    gradient: "from-rose-400 via-fuchsia-500 to-violet-500",
    marks: [LuLandmark, LuSparkles, LuSun],
  },
  "santa cruz": {
    gradient: "from-emerald-400 via-teal-500 to-lime-400",
    marks: [LuTrees, LuLeaf, LuSun],
  },
  potosí: {
    gradient: "from-slate-500 via-sky-500 to-indigo-500",
    marks: [LuMountainSnow, LuCloud, LuStar],
  },
};

const DEFAULT_THEME: BannerTheme = {
  gradient: "from-violet-500 via-fuchsia-500 to-sky-400",
  marks: [LuSparkles, LuStar, LuCloud],
};

/** "La Paz, Bolivia" → "la paz". */
function cityKey(location: string) {
  return location.split(",")[0]?.trim().toLowerCase() ?? "";
}

/** Fixed spots for the drifting marks so the scene composes the same each render. */
const SPOTS = [
  "left-5 top-4 size-9 [animation-duration:7s]",
  "right-7 top-6 size-12 [animation-duration:9s] [animation-delay:-2s]",
  "right-16 bottom-3 size-7 [animation-duration:6s] [animation-delay:-1s]",
] as const;

export function CollectionBanner({
  location,
  className,
}: {
  location: string;
  className?: string;
}) {
  const theme = THEMES[cityKey(location)] ?? DEFAULT_THEME;

  return (
    <div
      className={cn(
        "relative h-32 overflow-hidden bg-gradient-to-br bg-[length:200%_200%] animate-[aygo-sheen_9s_ease-in-out_infinite] motion-reduce:animate-none",
        theme.gradient,
        className,
      )}
    >
      {/* Soft light pooling for depth over the flat gradient. */}
      <div
        aria-hidden
        className="absolute inset-0 bg-[radial-gradient(120%_90%_at_15%_-10%,rgba(255,255,255,0.45),transparent_55%)]"
      />

      {/* Drifting decorative marks — the "alive" element. The scene quietly
          shifts with where you are; no place label, that read as noise. */}
      {theme.marks.map((Mark, i) => (
        <Mark
          key={i}
          aria-hidden
          className={cn(
            "absolute text-white/30 drop-shadow-sm animate-[aygo-float_7s_ease-in-out_infinite] motion-reduce:animate-none",
            SPOTS[i % SPOTS.length],
          )}
        />
      ))}
    </div>
  );
}
