// Tiny presentational primitives reused across screens. Pure components,
// no data — keep them dumb so they're easy to compose.

import { cn } from "@/lib/utils";

export function Section({
  title,
  subtitle,
  action,
  onAction,
  tone = "light",
  children,
}: {
  title: string;
  subtitle?: string;
  action?: string;
  onAction?: () => void;
  /** Visual tone — `dark` is used over the violet home backdrop. */
  tone?: "light" | "dark";
  children: React.ReactNode;
}) {
  const dark = tone === "dark";
  return (
    <section>
      <div className="mb-2.5 flex items-end justify-between px-0.5">
        <div>
          {subtitle && (
            <p
              className={cn(
                "text-[10.5px] font-semibold uppercase tracking-wider",
                dark ? "text-fuchsia-300/90" : "text-amber-600",
              )}
            >
              {subtitle}
            </p>
          )}
          <h2
            className={cn(
              "text-[16px] font-semibold tracking-tight",
              dark ? "text-white" : "text-slate-900",
            )}
          >
            {title}
          </h2>
        </div>
        {action && (
          <button
            onClick={onAction}
            className={cn(
              "inline-flex items-center gap-0.5 text-[12px] font-semibold transition-colors",
              dark ? "text-violet-200/90 hover:text-white" : "text-slate-500",
            )}
          >
            {action}
            {dark && (
              <span aria-hidden className="text-[13px] leading-none">
                ›
              </span>
            )}
          </button>
        )}
      </div>
      {children}
    </section>
  );
}

export function Stat({ n, label }: { n: string; label: string }) {
  return (
    <div className="px-3">
      <p className="text-[20px] font-semibold text-slate-900">{n}</p>
      <p className="text-[11px] text-slate-500">{label}</p>
    </div>
  );
}

export function ProfileRow({
  emoji,
  title,
  sub,
  onClick,
}: {
  emoji: string;
  title: string;
  sub: string;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-3 rounded-2xl bg-white/80 p-3 text-left ring-1 ring-white backdrop-blur"
    >
      <span className="grid size-10 place-items-center rounded-xl bg-amber-50 text-lg">
        {emoji}
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[13.5px] font-semibold text-slate-900">
          {title}
        </p>
        <p className="truncate text-[11.5px] text-slate-500">{sub}</p>
      </div>
      <span className="text-slate-400">›</span>
    </button>
  );
}

export function Stars({ value }: { value: number }) {
  const full = Math.floor(value);
  return (
    <p className="text-[15px] text-amber-400">
      {"★".repeat(full)}
      <span className="text-slate-200">{"★".repeat(5 - full)}</span>
    </p>
  );
}

export function ReviewRow({
  avatar,
  name,
  text,
}: {
  avatar: string;
  name: string;
  text: string;
}) {
  return (
    <div className="flex items-start gap-3 rounded-2xl bg-slate-50 p-3">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`https://picsum.photos/seed/${avatar}/100/100`}
        alt={name}
        className="size-9 shrink-0 rounded-full object-cover"
      />
      <div className="min-w-0 flex-1">
        <p className="text-[13px] font-semibold text-slate-900">{name}</p>
        <p className="text-[12px] leading-snug text-slate-600">{text}</p>
      </div>
    </div>
  );
}

export function BackButton({ onClick }: { onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      aria-label="Volver"
      className="grid size-9 place-items-center rounded-full bg-white/70 text-slate-700 ring-1 ring-white backdrop-blur"
    >
      ‹
    </button>
  );
}

export function MoreButton() {
  return (
    <button
      aria-label="Más"
      className="grid size-9 place-items-center rounded-full bg-white/70 text-slate-700 ring-1 ring-white backdrop-blur"
    >
      ⋯
    </button>
  );
}
