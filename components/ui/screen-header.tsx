import { cn } from "@/lib/utils";

/** Top-of-screen title block: muted eyebrow + title, optional trailing slot. */
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
    <header className={cn("flex items-start justify-between gap-3", className)}>
      <div className="min-w-0">
        {eyebrow && (
          <p className="text-[13px] font-medium text-muted-foreground">
            {eyebrow}
          </p>
        )}
        <h1 className="text-[28px] font-semibold tracking-tight text-foreground">
          {title}
        </h1>
      </div>
      {trailing && <div className="shrink-0">{trailing}</div>}
    </header>
  );
}
