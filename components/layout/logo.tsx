import Image from "next/image";

import { cn } from "@/lib/utils";

/**
 * The mark that reads on the surface behind it: the navy mark on light chrome,
 * the cream mark on dark chrome. Naming follows the surface tone, so the file
 * matches the `tone` prop directly.
 */
const MARK = {
  light: "/aygo-light.png", // navy "A" mark — for light surfaces
  dark: "/aygo-dark.png", // cream "A" mark — for dark surfaces
} as const;

/**
 * The aygo brand lockup. Shared by the top bar and the footer so the logo stays
 * consistent everywhere. `tone` selects the mark for the surface behind it.
 *
 * Below desktop (phones, tablets) it's just the mark, sized up so it carries on
 * its own; the "aygo." wordmark only joins on screens wider than a tablet.
 *
 * Renders inline content only (no link) so callers decide whether it navigates.
 */
export function Logo({
  tone = "light",
  className,
}: {
  tone?: "light" | "dark";
  className?: string;
}) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <Image
        src={MARK[tone]}
        alt="aygo"
        width={1254}
        height={1254}
        priority
        className="size-9 lg:size-8"
      />
      {/* Wordmark only past tablet width; otherwise the mark stands alone. */}
      <span
        className={cn(
          "hidden text-[19px] font-bold tracking-tight lg:inline",
          tone === "dark" ? "text-white" : "text-foreground",
        )}
      >
        aygo<span className="text-amber-500">.</span>
      </span>
    </span>
  );
}
