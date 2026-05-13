import { cn } from "@/lib/utils";

export type AiInsightCardProps = {
  emoji: string;
  label: string;
  target: string;
  /** Tailwind gradient classes, e.g. "from-rose-100 to-amber-100". */
  bg: string;
  className?: string;
};

/**
 * Small gradient tile used in the "Hoy según tu perfil" row on the home
 * screen. The gradient is passed in as Tailwind utilities so each insight
 * can carry its own palette through data.
 */
export function AiInsightCard({
  emoji,
  label,
  target,
  bg,
  className,
}: AiInsightCardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl bg-gradient-to-br p-3 text-center shadow-[0_1px_0_rgba(0,0,0,0.04)] ring-1 ring-white/60",
        bg,
        className,
      )}
    >
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-white/70 text-2xl shadow-sm">
        {emoji}
      </div>
      <p className="mt-2 text-[10.5px] font-semibold leading-tight text-slate-700">
        {label}
      </p>
      <p className="text-[10.5px] font-medium text-slate-500">{target}</p>
    </div>
  );
}
