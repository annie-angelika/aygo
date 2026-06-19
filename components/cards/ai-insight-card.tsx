import { cn } from "@/lib/utils";

export type AiInsightCardProps = {
  /** Optional react-icons node; takes precedence over `emoji` when provided. */
  icon?: React.ReactNode;
  emoji?: string;
  label: string;
  target: string;
  /** Tailwind gradient classes, e.g. "from-rose-100 to-amber-100". */
  bg?: string;
  /** Visual tone — `dark` is used over the violet home backdrop. */
  tone?: "light" | "dark";
  className?: string;
};

/**
 * Compact "insight" tile in the home AI row. In dark tone the icon sits on its
 * own (no nested badge box) so the tile reads as a single surface; per-insight
 * accent colors come in through `className` + the icon's own color class.
 */
export function AiInsightCard({
  icon,
  emoji,
  label,
  target,
  bg,
  tone = "light",
  className,
}: AiInsightCardProps) {
  const dark = tone === "dark";

  if (dark) {
    return (
      <div
        className={cn(
          "flex flex-col gap-2 rounded-2xl p-3 text-left ring-1 ring-white/[0.12]",
          "bg-white/[0.05] shadow-[0_12px_28px_-18px_rgba(124,58,237,0.85),inset_0_1px_0_0_rgba(255,255,255,0.06)]",
          "transition-transform duration-150 active:scale-[0.97]",
          className,
        )}
      >
        {/* Bare icon — no badge box, so there's no card-inside-card. */}
        <span className="text-[26px] leading-none">{icon ?? emoji}</span>
        <div>
          <p className="text-[11px] font-semibold leading-tight text-white">
            {label}
          </p>
          <p className="mt-0.5 text-[10.5px] font-medium text-violet-200/70">
            {target}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "rounded-2xl bg-gradient-to-br p-3 text-center shadow-[0_1px_0_rgba(0,0,0,0.04)] ring-1 ring-white/60",
        bg,
        className,
      )}
    >
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-white/70 text-2xl text-slate-700 shadow-sm">
        {icon ?? emoji}
      </div>
      <p className="mt-2 text-[10.5px] font-semibold leading-tight text-slate-700">
        {label}
      </p>
      <p className="text-[10.5px] font-medium text-slate-500">{target}</p>
    </div>
  );
}
