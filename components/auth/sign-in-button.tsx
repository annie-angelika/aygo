"use client";

import { ConsentNote } from "@/components/auth/consent-note";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";

/**
 * Opens Pollar's social-login modal. The whole app's login entry point — used
 * in the top bar (signed-out) and on any gate. Look is driven by `className`
 * so it can be a nav pill or a full-width CTA without new components.
 *
 * `withConsent` adds the Terms/Privacy line underneath for standalone CTAs;
 * `tone` only matters for that line (dark = over the violet create canvas).
 */
export function SignInButton({
  className,
  children = "Sign In",
  withConsent = false,
  tone = "light",
}: {
  className?: string;
  children?: React.ReactNode;
  withConsent?: boolean;
  tone?: "light" | "dark";
}) {
  const { openLoginModal } = useAuth();
  const button = (
    <Button onClick={openLoginModal} className={cn(className)}>
      {children}
    </Button>
  );
  if (!withConsent) return button;
  return (
    <div className="flex flex-col items-center gap-1.5">
      {button}
      <ConsentNote tone={tone} />
    </div>
  );
}
