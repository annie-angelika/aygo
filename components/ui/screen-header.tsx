import { cn } from "@/lib/utils";

/**
 * Top-of-screen greeting block. The eyebrow stays muted; the title can
 * include a highlighted span (e.g. "Bolivia 🇧🇴") — pass it via `accent`.
 */
export type ScreenHeaderProps = {
  eyebrow: string;
  title: string;
  accent?: React.ReactNode;
  className?: string;
};

export function ScreenHeader({
  eyebrow,
  title,
  accent,
  className,
}: ScreenHeaderProps) {
  return (
    <header className={cn(className)}>
      <p className="text-[15px] font-medium text-slate-600">{eyebrow}</p>
      <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
        {title} {accent && <span className="text-amber-500">{accent}</span>}
      </h1>
    </header>
  );
}
