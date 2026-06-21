import { cn } from "@/lib/utils";

/** Lightweight section header: title + optional right-aligned action slot. */
export function SectionTitle({
  children,
  action,
  className,
}: {
  children: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "mb-3 flex items-baseline justify-between px-0.5",
        className,
      )}
    >
      <h2 className="text-[16px] font-semibold tracking-tight text-foreground">
        {children}
      </h2>
      {action}
    </div>
  );
}
