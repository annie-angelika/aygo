import Link from "next/link";
import type { Metadata } from "next";
import { LuSearch, LuCompass } from "react-icons/lu";

import { TopBar } from "@/components/layout/top-bar";

export const metadata: Metadata = {
  title: "Page not found",
};

/**
 * Global 404. The root `not-found` catches every unmatched URL across the app,
 * so it lives outside the warm `(app)` shell and owns its own full-screen
 * surface — the deep-violet `tone="dark"` backdrop from the design system, with
 * the app's header navigation (dark variant) on top so there's always a way out.
 */
export default function NotFound() {
  return (
    <div className="flex min-h-svh flex-col [background-image:radial-gradient(120%_55%_at_50%_-10%,#16305f_0%,#0f2650_42%,#091935_100%)]">
      <TopBar tone="dark" />

      <main className="flex flex-1 flex-col items-center justify-center overflow-hidden px-6 pb-20 text-center lg:mx-auto lg:w-full lg:max-w-md lg:py-24">
        {/* Ghosted hero glyph with a soft violet glow behind it. */}
        <div className="relative mb-10 grid place-items-center" aria-hidden>
          <div className="absolute size-44 rounded-full bg-gold/15 blur-3xl" />
          <LuSearch className="relative size-32 text-white/[0.07]" strokeWidth={1.25} />
        </div>

        <h1 className="text-[26px] font-semibold tracking-tight text-cream sm:text-[28px]">
          404 · Page Not Found
        </h1>
        <p className="mt-3 max-w-[34ch] text-[15px] leading-relaxed text-cream/60">
          Looks like you discovered a page that doesn&rsquo;t exist or you
          don&rsquo;t have access to.
        </p>

        <Link
          href="/discover"
          className="mt-8 inline-flex h-11 items-center gap-2 rounded-xl bg-white/[0.06] px-5 text-[14px] font-semibold text-cream ring-1 ring-white/10 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400/60"
        >
          <LuCompass className="size-[18px]" aria-hidden />
          Discover events
        </Link>
      </main>
    </div>
  );
}
