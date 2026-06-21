import type { IconType } from "react-icons";
import { cn } from "@/lib/utils";

/**
 * Friendly placeholder for empty/zero surfaces. Never leave a dead screen —
 * every empty list renders one of these with a way forward.
 */
export function EmptyState({
  icon: Icon,
  title,
  subtitle,
  action,
  className,
}: {
  icon: IconType;
  title: string;
  subtitle?: string;
  /** Optional CTA (e.g. a <Link> or button). */
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center gap-1 rounded-2xl bg-card/60 px-6 py-10 text-center ring-1 ring-border",
        className,
      )}
    >
      <div className="mb-1 grid size-12 place-items-center rounded-full bg-muted text-muted-foreground">
        <Icon className="size-6" aria-hidden />
      </div>
      <p className="text-[14px] font-semibold text-foreground">{title}</p>
      {subtitle && (
        <p className="max-w-[26ch] text-[12.5px] leading-snug text-muted-foreground">
          {subtitle}
        </p>
      )}
      {action && <div className="mt-3">{action}</div>}
    </div>
  );
}
