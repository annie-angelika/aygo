"use client";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";

/**
 * Opens Pollar's social-login modal. The whole app's login entry point — used
 * in the top bar (signed-out) and on any gate. Look is driven by `className`
 * so it can be a nav pill or a full-width CTA without new components.
 */
export function SignInButton({
  className,
  children = "Sign In",
}: {
  className?: string;
  children?: React.ReactNode;
}) {
  const { openLoginModal } = useAuth();
  return (
    <Button onClick={openLoginModal} className={cn(className)}>
      {children}
    </Button>
  );
}
