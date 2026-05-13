import type { Event } from "@/types";
import { cn } from "@/lib/utils";

export type EventRowProps = {
  event: Event;
  /** Right-side action element. Defaults to a "Ver" pill. */
  trailing?: React.ReactNode;
  onClick?: () => void;
  className?: string;
};

/**
 * Compact event row: thumb + name + region · date + action. Wrapping in
 * a Link or button is left to the consumer (some events open detail, some
 * just toggle reminders).
 */
export function EventRow({ event: e, trailing, onClick, className }: EventRowProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 rounded-2xl bg-white/80 p-2.5 ring-1 ring-white shadow-[0_1px_0_rgba(0,0,0,0.04)] backdrop-blur",
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
        <p className="truncate text-[14px] font-semibold text-slate-900">
          {e.name}
        </p>
        <p className="text-[12px] text-slate-500">
          {e.region} · {e.date}
        </p>
      </div>
      {trailing ?? (
        <span className="rounded-full bg-amber-300 px-3 py-1 text-[11px] font-semibold text-slate-900">
          Ver
        </span>
      )}
    </div>
  );
}
