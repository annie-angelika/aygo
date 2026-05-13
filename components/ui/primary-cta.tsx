import Link from "next/link";
import { cn } from "@/lib/utils";

/**
 * Large rounded-black CTA used across screens. Polymorphic: renders an
 * `<a>` with rel/target when `external`, a `<Link>` for internal hrefs,
 * a `<button>` otherwise. Style overrides come last via `className`.
 */
export type PrimaryCtaProps = {
  children: React.ReactNode;
  href?: string;
  external?: boolean;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
  className?: string;
};

const baseClasses =
  "flex w-full items-center justify-center gap-2 rounded-full bg-slate-900 py-3.5 text-[14px] font-semibold text-white shadow-[0_12px_24px_-12px_rgba(15,23,42,0.5)] transition-colors hover:bg-slate-800";

export function PrimaryCta({
  children,
  href,
  external,
  onClick,
  type = "button",
  className,
}: PrimaryCtaProps) {
  const cls = cn(baseClasses, className);

  if (href && external) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={cls}
      >
        {children}
      </a>
    );
  }
  if (href) {
    return (
      <Link href={href} className={cls}>
        {children}
      </Link>
    );
  }
  return (
    <button type={type} onClick={onClick} className={cls}>
      {children}
    </button>
  );
}
