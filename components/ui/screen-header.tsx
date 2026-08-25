import { cn } from "@/lib/utils";

/** Top-of-screen title block: gold eyebrow + bold title, optional trailing slot. */
export type ScreenHeaderProps = {
  title: string;
  eyebrow?: string;
  trailing?: React.ReactNode;
  className?: string;
};

export function ScreenHeader({
  title,
  eyebrow,
  trailing,
  className,
}: ScreenHeaderProps) {
  return (
    <header className={cn("flex items-center justify-between gap-3", className)}>
      <div className="flex min-w-0 flex-col gap-0.5">
        {eyebrow && (
          <p className="text-[10.5px] font-semibold uppercase tracking-[0.08em] text-gold-deep">
            {eyebrow}
          </p>
        )}
        <h1 className="truncate text-[28px] font-bold leading-[1.1] tracking-[-0.03em] text-foreground">
          {title}
        </h1>
      </div>
      {trailing && <div className="shrink-0">{trailing}</div>}
    </header>
  );
}
