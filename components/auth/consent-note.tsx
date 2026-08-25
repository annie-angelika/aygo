import Link from "next/link";

import { cn } from "@/lib/utils";

const TONE = {
  light: "text-muted-foreground",
  dark: "text-cream/60",
} as const;

/**
 * One-line "by signing in you agree…" notice shown under any sign-in CTA.
 * Defined once so the wording and the legal links never drift between gates.
 * The links open in a new tab so a sign-in in progress isn't lost.
 */
export function ConsentNote({
  tone = "light",
  className,
}: {
  tone?: "light" | "dark";
  className?: string;
}) {
  return (
    <p
      className={cn(
        "max-w-[32ch] text-center text-[11px] leading-snug",
        TONE[tone],
        className,
      )}
    >
      By signing in you agree to our{" "}
      <Link href="/terms" target="_blank" rel="noopener" className="underline underline-offset-2">
        Terms
      </Link>{" "}
      and{" "}
      <Link href="/privacy" target="_blank" rel="noopener" className="underline underline-offset-2">
        Privacy Policy
      </Link>
      .
    </p>
  );
}
