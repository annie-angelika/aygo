import { cn } from "@/lib/utils";

/**
 * A single count + label. Default is a stacked column; `inline` renders
 * "value label" on one line (Luma-style stat rows).
 */
export function Stat({
  value,
  label,
  inline,
  className,
}: {
  value: React.ReactNode;
  label: string;
  inline?: boolean;
  className?: string;
}) {
  if (inline) {
    return (
      <span className={cn("text-[13px]", className)}>
        <span className="font-semibold text-foreground">{value}</span>{" "}
        <span className="text-muted-foreground">{label}</span>
      </span>
    );
  }
  return (
    <div className={cn("flex flex-col", className)}>
      <span className="text-[18px] font-semibold leading-none text-foreground">
        {value}
      </span>
      <span className="mt-1 text-[11.5px] text-muted-foreground">{label}</span>
    </div>
  );
}
