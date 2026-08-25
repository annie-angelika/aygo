"use client";

import Link from "next/link";
import { LuLock, LuCompass } from "react-icons/lu";
import type { IconType } from "react-icons";

import { EmptyState } from "@/components/ui/empty-state";
import { IllimaniRidge } from "@/components/ui/brand-icons";
import { ConsentNote } from "@/components/auth/consent-note";
import { SignInButton } from "@/components/auth/sign-in-button";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";

/**
 * Route-level guard: renders `children` when signed in, otherwise a friendly
 * "sign in to continue" prompt. Browsing stays open elsewhere — this only wraps
 * the screens that need an identity (your tickets, creating an event).
 *
 * `tone="dark"` is the navy full-screen gate (dark create canvases); the
 * default sits on the cream paper inside the shell.
 */
export function AuthGate({
  icon: Icon = LuLock,
  title,
  description,
  tone = "light",
  children,
}: {
  icon?: IconType;
  title: string;
  description: string;
  tone?: "light" | "dark";
  children: React.ReactNode;
}) {
  const { isAuthenticated } = useAuth();
  if (isAuthenticated) return <>{children}</>;

  if (tone === "dark") {
    return (
      <div className="relative grid min-h-svh place-items-center overflow-hidden bg-navy px-6 lg:py-24">
        <IllimaniRidge className="h-24" />
        <div className="relative flex w-full max-w-sm flex-col items-center gap-1 rounded-[18px] bg-white/[0.06] px-6 py-10 text-center ring-1 ring-white/10">
          <div className="mb-1 grid size-12 place-items-center rounded-full bg-white/10 text-gold">
            <Icon className="size-6" aria-hidden />
          </div>
          <p className="text-[14px] font-semibold text-cream">{title}</p>
          <p className="max-w-[26ch] text-[12.5px] leading-snug text-cream/70">
            {description}
          </p>
          <div className="mt-4 flex w-full flex-col items-center gap-2">
            <SignInButton className="h-11 w-full rounded-full bg-gold text-[14px] font-semibold text-navy hover:bg-gold/90" />
            <ConsentNote tone="dark" />
            <Link
              href="/discover"
              className="inline-flex h-10 w-full items-center justify-center gap-1.5 rounded-full text-[13px] font-semibold text-cream/80 transition-colors hover:text-cream"
            >
              <LuCompass className="size-4" aria-hidden />
              Browse events instead
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("px-4 pt-10 lg:mx-auto lg:w-full lg:max-w-md lg:py-24")}>
      <EmptyState
        icon={Icon}
        title={title}
        subtitle={description}
        action={
          <div className="flex flex-col items-center gap-2">
            <SignInButton className="h-11 rounded-full px-8 text-[14px] font-semibold" />
            <ConsentNote />
            <Link
              href="/discover"
              className="inline-flex h-9 items-center gap-1.5 rounded-full px-3 text-[12.5px] font-semibold text-muted-foreground transition-colors hover:text-foreground"
            >
              <LuCompass className="size-4" aria-hidden />
              Browse events instead
            </Link>
          </div>
        }
      />
    </div>
  );
}
