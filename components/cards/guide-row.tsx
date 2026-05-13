import type { Guide } from "@/types";
import { WhatsAppButton } from "@/components/ui/whatsapp-button";
import { cn } from "@/lib/utils";

export type GuideRowProps = {
  guide: Guide;
  /** Override the trailing action (defaults to a WhatsApp pill). */
  trailing?: React.ReactNode;
  className?: string;
};

/**
 * Guide list row used in the profile screen and elsewhere. By default
 * shows a WhatsApp button that deep-links to the guide's phone.
 */
export function GuideRow({ guide: g, trailing, className }: GuideRowProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-2xl bg-white/80 p-2.5 ring-1 ring-white backdrop-blur",
        className,
      )}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={g.avatar}
        alt={g.name}
        className="size-11 shrink-0 rounded-full object-cover"
      />
      <div className="min-w-0 flex-1">
        <p className="truncate text-[13.5px] font-semibold text-slate-900">
          {g.name} <span className="text-slate-400">· {g.city}</span>
        </p>
        <p className="truncate text-[11.5px] text-slate-500">
          {g.focus} · {g.trips} viajes
        </p>
      </div>
      {trailing ?? (
        <WhatsAppButton
          phone={g.phone}
          text={`Hola ${g.name}, te encontré en Aygo`}
        />
      )}
    </div>
  );
}
