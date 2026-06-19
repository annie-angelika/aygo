import type { Event } from "@/types";
import { cn } from "@/lib/utils";

export type EventRowProps = {
  event: Event;
  /** Right-side action element. Defaults to a "Ver" pill. */
  trailing?: React.ReactNode;
  /** Visual tone — `dark` is used over the violet home backdrop. */
  tone?: "light" | "dark";
  onClick?: () => void;
  className?: string;
};

/**
 * Compact event row: thumb + name + region · date + action. Wrapping in
 * a Link or button is left to the consumer (some events open detail, some
 * just toggle reminders).
 */
export function EventRow({
  event: e,
  trailing,
  tone = "light",
  onClick,
  className,
}: EventRowProps) {
  const dark = tone === "dark";
  return (
    <div
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 rounded-2xl p-2.5 backdrop-blur",
        dark
          ? "bg-white/[0.05] ring-1 ring-white/[0.12] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)]"
          : "bg-white/80 ring-1 ring-white shadow-[0_1px_0_rgba(0,0,0,0.04)]",
        onClick && "cursor-pointer",
        className,
      )}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={e.img}
        alt={e.name}
        className="h-14 w-14 shrink-0 rounded-xl object-cover"
      />
      <div className="min-w-0 flex-1">
        <p
          className={cn(
            "truncate text-[14px] font-semibold",
            dark ? "text-white" : "text-slate-900",
          )}
        >
          {e.name}
        </p>
        <p
          className={cn(
            "text-[12px]",
            dark ? "text-violet-200/70" : "text-slate-500",
          )}
        >
          {e.region} · {e.date}
        </p>
      </div>
      {trailing ??
        (dark ? (
          <span className="rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 px-3 py-1 text-[11px] font-semibold text-white">
            Ver
          </span>
        ) : (
          <span className="rounded-full bg-amber-300 px-3 py-1 text-[11px] font-semibold text-slate-900">
            Ver
          </span>
        ))}
    </div>
  );
}
