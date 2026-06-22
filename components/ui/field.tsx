import { cn } from "@/lib/utils";

/** A labelled form control: bold label stacked over its input (settings-style). */
export function Field({
  label,
  className,
  children,
}: {
  label: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <label className={cn("flex min-w-0 flex-col gap-1.5", className)}>
      <span className="text-[12px] font-semibold text-foreground">{label}</span>
      {children}
    </label>
  );
}
