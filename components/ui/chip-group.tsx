import { cn } from "@/lib/utils";

/** A labelled single-select row of chips, generic over the option value. */
export function ChipGroup<T extends string>({
  label,
  value,
  options,
  onChange,
  className,
}: {
  label: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (value: T) => void;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <span className="text-[10.5px] font-semibold uppercase tracking-[0.08em] text-gold-deep">
        {label}
      </span>
      <div className="flex flex-wrap gap-1.5">
        {options.map((o) => {
          const selected = o.value === value;
          return (
            <button
              key={o.value}
              type="button"
              aria-pressed={selected}
              onClick={() => onChange(o.value)}
              className={cn(
                "inline-flex h-8 items-center rounded-full px-3 text-[12.5px] font-semibold ring-1 transition-colors",
                selected
                  ? "bg-primary text-primary-foreground ring-transparent"
                  : "bg-card text-foreground ring-border hover:bg-secondary/60",
              )}
            >
              {o.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
