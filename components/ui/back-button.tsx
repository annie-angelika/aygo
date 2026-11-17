"use client";

import { useRouter } from "next/navigation";
import { LuChevronLeft } from "react-icons/lu";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * Is there a previous aygo page in this tab to go back to?
 *
 * Someone who opens a shared link (an event, a profile, a city) lands with no
 * app history at all: `router.back()` then does nothing in a fresh tab, or
 * leaves aygo for whatever site was there before. The Navigation API only
 * counts same-origin entries, which is exactly the question; without it
 * (older browsers) the referrer says whether we got here from inside the app.
 */
function hasAppHistory(): boolean {
  const nav = (window as { navigation?: { canGoBack?: boolean } }).navigation;
  if (nav && typeof nav.canGoBack === "boolean") return nav.canGoBack;
  if (window.history.length <= 1) return false;
  try {
    return !!document.referrer && new URL(document.referrer).origin === window.location.origin;
  } catch {
    return false;
  }
}

/**
 * White pill back button (shadcn Button). Pops the router when there is an
 * aygo page behind this one; otherwise goes to `fallback` (Discover, the app's
 * front door) so the button always leads somewhere.
 */
export function BackButton({
  className,
  fallback = "/discover",
}: {
  className?: string;
  fallback?: string;
}) {
  const router = useRouter();
  return (
    <Button
      type="button"
      size="icon-lg"
      variant="secondary"
      aria-label="Back"
      onClick={() => (hasAppHistory() ? router.back() : router.push(fallback))}
      className={cn(
        "rounded-full bg-card text-foreground ring-1 ring-border hover:bg-muted",
        className,
      )}
    >
      <LuChevronLeft className="size-5" />
    </Button>
  );
}
