import Link from "next/link";
import { LuSparkles, LuArrowRight } from "react-icons/lu";
import type { Destination } from "@/types";

/**
 * Full-width "AI pick" hero on the home screen — the focal point above the
 * browse carousels. Photo backdrop + violet scrim + a sparkle eyebrow give the
 * app its AI-travel personality and a single, confident call to action.
 */
export function AiPickCard({ destination: d }: { destination: Destination }) {
  return (
    <Link
      href={`/place/${d.id}`}
      className="relative block h-[184px] overflow-hidden rounded-3xl bg-gradient-to-br from-violet-700 via-[#3a1d6e] to-fuchsia-800 ring-1 ring-white/10 shadow-[0_22px_44px_-22px_rgba(124,58,237,0.8)] transition-transform duration-150 active:scale-[0.99]"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={d.img || d.hero}
        alt={d.name}
        className="h-full w-full object-cover object-center"
      />
      {/* Scrim: photo stays visible up top, text legible over the dark base.
          If the photo is slow/unavailable the brand gradient above shows. */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#160d30] via-[#160d30]/35 to-transparent" />

      <span className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-white/15 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-white ring-1 ring-white/25 backdrop-blur">
        <LuSparkles className="size-3.5 text-fuchsia-200" aria-hidden />
        Recomendación IA
      </span>

      <div className="absolute inset-x-4 bottom-4 flex items-end justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] font-medium text-violet-200/85">
            {d.region}
          </p>
          <h3 className="truncate text-[21px] font-semibold leading-tight text-white">
            {d.name}
          </h3>
          <p className="mt-0.5 truncate text-[12.5px] text-white/75">
            {d.tagline}
          </p>
        </div>
        <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 px-3.5 py-2 text-[12.5px] font-semibold text-white shadow-[0_10px_24px_-8px_rgba(217,70,239,0.8)]">
          Ver plan
          <LuArrowRight className="size-4" aria-hidden />
        </span>
      </div>
    </Link>
  );
}
