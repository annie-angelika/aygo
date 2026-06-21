import { cn } from "@/lib/utils";

/** A single count + label, used in profile-style stat rows. */
export function Stat({
  value,
  label,
  className,
}: {
  value: React.ReactNode;
  label: string;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col", className)}>
      <span className="text-[18px] font-semibold leading-none text-foreground">
        {value}
      </span>
      <span className="mt-1 text-[11.5px] text-muted-foreground">{label}</span>
    </div>
  );
}
