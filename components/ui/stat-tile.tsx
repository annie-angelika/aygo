import type { IconType } from "react-icons";

import { cn } from "@/lib/utils";

/**
 * A dashboard number: eyebrow label (with an optional icon), the value, and an
 * optional one-line hint underneath (a delta, a breakdown). Generic — the
 * caller formats the value.
 */
export function StatTile({
  label,
  value,
  hint,
  icon: Icon,
  className,
}: {
  label: string;
  value: number | string;
  hint?: React.ReactNode;
  icon?: IconType;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-1 rounded-2xl bg-card px-3.5 py-3 ring-1 ring-border", className)}>
      <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        {Icon && <Icon className="size-3.5 text-gold-deep" aria-hidden />}
        {label}
      </span>
      <span className="text-[20px] font-semibold leading-none tracking-tight tabular-nums text-foreground">
        {typeof value === "number" ? value.toLocaleString() : value}
      </span>
      {hint && <span className="truncate text-[11.5px] text-muted-foreground">{hint}</span>}
    </div>
  );
}
