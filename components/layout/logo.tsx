import Image from "next/image";

import { cn } from "@/lib/utils";

/**
 * The mark that reads on the surface behind it: the navy mark on light chrome,
 * the cream mark on dark (navy) chrome. Naming follows the surface tone, so the
 * file matches the `tone` prop directly.
 */
const MARK = {
  light: "/aygo-light.png", // navy "A" mark — for light surfaces
  dark: "/aygo-dark.png", // cream "A" mark — for dark surfaces
} as const;

/**
 * The aygo brand lockup. Shared by the top bar and the footer so the logo stays
 * consistent everywhere. `tone` selects the mark for the surface behind it.
 *
 * `wordmark="auto"` (default) shows "aygo." only past tablet width — in the
 * top bar the mark stands alone on phones. `wordmark="always"` keeps it (the
 * footer); `"never"` is mark-only.
 *
 * Renders inline content only (no link) so callers decide whether it navigates.
 */
export function Logo({
  tone = "light",
  wordmark = "auto",
  className,
}: {
  tone?: "light" | "dark";
  wordmark?: "auto" | "always" | "never";
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
      {wordmark !== "never" && (
        <span
          className={cn(
            "text-[19px] font-bold tracking-tight",
            wordmark === "auto" && "hidden lg:inline",
            tone === "dark" ? "text-cream" : "text-foreground",
          )}
        >
          aygo<span className="text-gold">.</span>
        </span>
      )}
    </span>
  );
}
