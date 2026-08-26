import type { Metadata } from "next";
import { LuLockKeyhole } from "react-icons/lu";

import { Logo } from "@/components/layout/logo";
import { safeNext } from "@/lib/server/dev-access";

export const metadata: Metadata = {
  title: "Dev access",
  robots: { index: false, follow: false },
};

/**
 * The lock screen for the dev deployment. The proxy sends every visitor here
 * until they enter the access code (see lib/server/dev-access.ts). Lives
 * outside the `(app)` shell on the same dark surface as the 404 — it's chrome
 * around the app, not a screen inside it. Plain form POST, no client JS.
 */
export default async function DevAccessPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const params = await searchParams;
  const next = safeNext(params.next);
  const failed = params.error === "1";

  return (
    <div className="flex min-h-svh flex-col [background-image:radial-gradient(120%_55%_at_50%_-10%,#16305f_0%,#0f2650_42%,#091935_100%)]">
      <main className="flex flex-1 flex-col items-center justify-center px-6 pb-20 lg:mx-auto lg:w-full lg:max-w-md lg:py-24">
        <Logo tone="dark" wordmark="always" className="mb-10" />

        <div className="mb-6 grid size-14 place-items-center rounded-2xl bg-white/[0.06] ring-1 ring-white/10">
          <LuLockKeyhole className="size-6 text-gold" aria-hidden />
        </div>

        <h1 className="text-[22px] font-semibold tracking-tight text-cream">
          Development build
        </h1>
        <p className="mt-2 max-w-[34ch] text-center text-[14px] leading-relaxed text-cream/60">
          This is the test version of aygo. Enter the access code to continue.
        </p>

        <form method="post" action="/api/dev-access" className="mt-8 w-full max-w-xs">
          <input type="hidden" name="next" value={next} />
          <label htmlFor="code" className="sr-only">
            Access code
          </label>
          <input
            id="code"
            name="code"
            type="password"
            autoComplete="off"
            autoCapitalize="off"
            spellCheck={false}
            required
            autoFocus
            placeholder="Access code"
            aria-invalid={failed || undefined}
            aria-describedby={failed ? "code-error" : undefined}
            className="h-11 w-full rounded-xl bg-white/[0.06] px-4 text-center text-[15px] tracking-[0.2em] text-cream ring-1 ring-white/10 outline-none transition-shadow placeholder:tracking-normal placeholder:text-cream/35 focus-visible:ring-2 focus-visible:ring-gold/60 aria-invalid:ring-red-400/60"
          />
          {failed && (
            <p id="code-error" role="alert" className="mt-2 text-center text-[12.5px] text-red-300">
              That code didn&rsquo;t match. Try again.
            </p>
          )}
          <button
            type="submit"
            className="mt-3 inline-flex h-11 w-full items-center justify-center rounded-xl bg-gold px-5 text-[14px] font-semibold text-navy transition-colors hover:bg-gold-deep focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/60"
          >
            Enter
          </button>
        </form>

        <p className="mt-8 text-center text-[12px] text-cream/40">
          Looking for the real app?{" "}
          <a href="https://aygo.app" className="text-cream/70 underline-offset-4 hover:underline">
            aygo.app
          </a>
        </p>
      </main>
    </div>
  );
}
