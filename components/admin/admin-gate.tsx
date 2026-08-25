"use client";

// The two locks in front of the admin dashboard, in order:
// 1. Pollar sign-in — who you are (the same social login as the app).
// 2. The admin key — what makes you *the* admin. Exchanged server-side for a
//    signed httpOnly cookie (lib/server/admin.ts); the key is never stored in
//    the browser. Pollar can't yet prove identity to our backend, so the key
//    is the real boundary and the social login is the identity layer over it.

import { useState } from "react";
import { LuLock, LuShieldCheck } from "react-icons/lu";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { SignInButton } from "@/components/auth/sign-in-button";
import { useAuth } from "@/hooks/use-auth";
import { useAdminSession } from "@/hooks/use-admin";

export function AdminGate({
  children,
}: {
  children: (ctx: { logout: () => Promise<void> }) => React.ReactNode;
}) {
  const { isAuthenticated } = useAuth();
  const { admin, login, logout } = useAdminSession();

  if (admin === null) {
    return (
      <div className="flex flex-col gap-3 px-4 pt-6">
        <Skeleton className="h-24 rounded-2xl" />
        <Skeleton className="h-40 rounded-2xl" />
      </div>
    );
  }

  if (!isAuthenticated && !admin) {
    return (
      <GateCard
        icon={<LuShieldCheck className="size-6" aria-hidden />}
        title="Admin access"
        subtitle="Sign in with your aygo account first, then unlock with the admin key."
      >
        <SignInButton className="h-11 w-full rounded-full text-[14px]">
          Sign in to continue
        </SignInButton>
      </GateCard>
    );
  }

  if (!admin) return <KeyForm onSubmit={login} />;

  return <>{children({ logout })}</>;
}

function KeyForm({ onSubmit }: { onSubmit: (key: string) => Promise<void> }) {
  const [key, setKey] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!key || busy) return;
    setBusy(true);
    setError(null);
    try {
      await onSubmit(key);
    } catch {
      setError("That key didn't match. Check it and try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <GateCard
      icon={<LuLock className="size-6" aria-hidden />}
      title="Unlock the dashboard"
      subtitle="Paste the admin key (AYGO_ADMIN_TOKEN). It's exchanged for a secure session — never stored here."
    >
      <form onSubmit={submit} className="flex w-full flex-col gap-2.5">
        <Input
          type="password"
          value={key}
          onChange={(e) => setKey(e.target.value)}
          placeholder="Admin key"
          aria-label="Admin key"
          autoFocus
        />
        {error && (
          <p className="text-[12px] font-medium text-destructive">{error}</p>
        )}
        <Button
          type="submit"
          disabled={!key || busy}
          className="h-11 w-full rounded-full text-[14px]"
        >
          {busy ? "Checking…" : "Unlock"}
        </Button>
      </form>
    </GateCard>
  );
}

/** Shared centered card for both gate steps. */
function GateCard({
  icon,
  title,
  subtitle,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-1 px-4 pt-16">
      <div className="flex w-full flex-col items-center gap-1 rounded-2xl bg-card px-6 py-10 text-center ring-1 ring-border">
        <div className="mb-1 grid size-12 place-items-center rounded-full bg-gold-soft text-gold-deep">
          {icon}
        </div>
        <p className="text-[16px] font-semibold tracking-tight text-foreground">
          {title}
        </p>
        <p className="max-w-[32ch] text-[12.5px] leading-snug text-muted-foreground">
          {subtitle}
        </p>
        <div className="mt-4 w-full">{children}</div>
      </div>
    </div>
  );
}
