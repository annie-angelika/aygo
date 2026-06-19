import { cn } from "@/lib/utils";

/**
 * Top-of-screen greeting block. The eyebrow stays muted; the title can
 * include a highlighted span (e.g. "Bolivia 🇧🇴") — pass it via `accent`.
 */
export type ScreenHeaderProps = {
  eyebrow: string;
  title: string;
  accent?: React.ReactNode;
  /** Optional element pinned to the top-right (e.g. an avatar). */
  trailing?: React.ReactNode;
  /** Visual tone — `dark` is used over the violet home backdrop. */
  tone?: "light" | "dark";
  className?: string;
};

export function ScreenHeader({
  eyebrow,
  title,
  accent,
  trailing,
  tone = "light",
  className,
}: ScreenHeaderProps) {
  const dark = tone === "dark";
  return (
    <header className={cn("flex items-start justify-between gap-3", className)}>
      <div className="min-w-0">
        <p
          className={cn(
            "text-[15px] font-medium",
            dark ? "text-violet-300/80" : "text-slate-600",
          )}
        >
          {eyebrow}
        </p>
        <h1
          className={cn(
            "text-3xl font-semibold tracking-tight",
            dark ? "text-white" : "text-slate-900",
          )}
        >
          {title}{" "}
          {accent && (
            <span className={dark ? "text-fuchsia-400" : "text-amber-500"}>
              {accent}
            </span>
          )}
        </h1>
      </div>
      {trailing && <div className="shrink-0">{trailing}</div>}
    </header>
  );
}
