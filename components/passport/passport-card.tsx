import Link from "next/link";
import { LuChevronRight } from "react-icons/lu";

import { AygoStar } from "@/components/ui/brand-icons";

/** Tappable collection summary on the profile — a navy card that opens the full aygo wall. */
export function PassportCard({
  count,
  href,
}: {
  count: number;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="relative flex items-center gap-4 overflow-hidden rounded-[18px] bg-navy p-4 text-cream transition-opacity hover:opacity-95"
    >
      <AygoStar
        className="pointer-events-none absolute -right-3.5 -top-3.5 size-24 text-gold opacity-[0.12]"
        aria-hidden
      />
      <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-gold text-navy">
        <AygoStar className="size-6" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[22px] font-bold leading-[1.2] tracking-[-0.03em]">
          {count} {count === 1 ? "aygo" : "aygos"}
        </p>
        <p className="mt-0.5 text-[11.5px] text-cream/70">
          Earned by attending events
        </p>
      </div>
      <span className="relative inline-flex h-[26px] shrink-0 items-center gap-0.5 rounded-full bg-white/12 pl-3 pr-2 text-[11.5px] font-semibold">
        View all
        <LuChevronRight className="size-3.5" aria-hidden />
      </span>
    </Link>
  );
}
