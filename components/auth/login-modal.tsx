"use client";

import { useEffect, useRef, useState } from "react";
import { usePollar } from "@pollar/react";
import type { AuthState } from "@pollar/core";
import { LuArrowLeft, LuLoaderCircle, LuMail } from "react-icons/lu";
import { FcGoogle } from "react-icons/fc";

import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ConsentNote } from "@/components/auth/consent-note";
import { closeLogin, useLoginOpen } from "@/components/auth/login-modal-store";
import { AygoStar, IllimaniRidge } from "@/components/ui/brand-icons";
import { cn } from "@/lib/utils";

/**
 * aygo's own sign-in modal, on Pollar's headless client (`@pollar/core`):
 * Google in one tap, or email → six-digit code. The SDK drives the flow and
 * reports every step through `onAuthStateChange`; this component only renders
 * it — navy sky with the star, cream card, gold focus — and closes itself the
 * moment a session exists. Replaces Pollar's stock modal.
 */
const ERRORS: Record<string, string> = {
  EMAIL_SEND_FAILED: "We couldn't send the code. Check the address and try again.",
  EMAIL_CODE_INVALID: "That code isn't right. Check your inbox and try again.",
  EMAIL_CODE_EXPIRED: "That code expired — request a new one.",
  EMAIL_VERIFY_FAILED: "We couldn't verify the code. Try again.",
  AUTH_FAILED: "Sign-in didn't go through. Try again.",
  SESSION_CREATE_FAILED: "We couldn't start a session. Check your connection.",
};

const EMPTY_CODE = ["", "", "", "", "", ""];

export function LoginModal() {
  const open = useLoginOpen();
  return (
    <Dialog open={open} onOpenChange={(o) => !o && closeLogin()}>
      <DialogContent className="max-w-sm gap-0 overflow-hidden p-0">
        {open && <LoginFlow />}
      </DialogContent>
    </Dialog>
  );
}

function LoginFlow() {
  const { getClient, isAuthenticated } = usePollar();
  // Seed from the client's current state; the subscription replays it too.
  const [auth, setAuth] = useState<AuthState>(() => getClient().getAuthState());
  const [email, setEmail] = useState("");
  const [code, setCode] = useState<string[]>(EMPTY_CODE);

  // Mirror the SDK's state; close as soon as a session exists.
  useEffect(() => {
    return getClient().onAuthStateChange((state) => {
      setAuth(state);
      if (state.step === "authenticated") closeLogin();
    });
  }, [getClient]);
  useEffect(() => {
    if (isAuthenticated) closeLogin();
  }, [isAuthenticated]);

  // Cancel an in-flight email/OAuth attempt if the modal is dismissed mid-way.
  useEffect(() => {
    return () => {
      const client = getClient();
      const s = client.getAuthState();
      if (s.step !== "authenticated" && s.step !== "idle") client.cancelLogin();
    };
  }, [getClient]);

  const busy =
    auth.step === "creating_session" ||
    auth.step === "sending_email" ||
    auth.step === "verifying_email_code" ||
    auth.step === "opening_oauth" ||
    auth.step === "authenticating";
  const codeStep =
    auth.step === "entering_code" ||
    auth.step === "verifying_email_code" ||
    (auth.step === "error" && auth.previousStep === "verifying_email_code");
  const error =
    auth.step === "error" ? (ERRORS[auth.errorCode] ?? auth.message ?? ERRORS.AUTH_FAILED) : null;
  const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

  function sendCode(e: React.FormEvent) {
    e.preventDefault();
    if (!validEmail || busy) return;
    setCode(EMPTY_CODE);
    getClient().login({ provider: "email", email: email.trim() });
  }
  function submitCode(next = code) {
    if (next.some((c) => !c) || busy) return;
    getClient().verifyEmailCode(next.join(""));
  }
  function google() {
    if (busy) return;
    getClient().login({ provider: "google" });
  }
  function back() {
    getClient().cancelLogin();
    setCode(EMPTY_CODE);
  }

  return (
    <div className="flex flex-col">
      {/* Navy sky with the star and the ridge — the same header as the app. */}
      <div className="relative flex h-32 items-center justify-center overflow-hidden bg-navy">
        <IllimaniRidge className="h-12" />
        <AygoStar className="absolute left-7 top-6 size-3 text-gold/40" />
        <AygoStar className="absolute right-10 top-9 size-2.5 text-gold/30" />
        <AygoStar className="absolute bottom-9 right-16 size-2 text-gold/40" />
        <AygoStar className="relative size-12 text-gold" />
      </div>

      <div className="flex flex-col gap-5 px-6 pb-6 pt-5">
        {codeStep ? (
          <>
            <div className="flex flex-col gap-1">
              <button
                type="button"
                onClick={back}
                className="mb-2 inline-flex w-fit items-center gap-1 text-[12.5px] font-semibold text-muted-foreground transition-colors hover:text-foreground"
              >
                <LuArrowLeft className="size-3.5" aria-hidden />
                Use another email
              </button>
              <DialogTitle className="text-[22px] font-bold tracking-[-0.03em]">
                Check your inbox
              </DialogTitle>
              <DialogDescription className="text-[13px] leading-snug">
                We sent a 6-digit code to{" "}
                <span className="font-semibold text-foreground">
                  {"email" in auth && auth.email ? auth.email : email}
                </span>
                . It expires in a few minutes.
              </DialogDescription>
            </div>
            <CodeBoxes value={code} onChange={setCode} onComplete={submitCode} disabled={busy} />
            {error && <ErrorLine>{error}</ErrorLine>}
            <Button
              size="lg"
              disabled={busy || code.some((c) => !c)}
              onClick={() => submitCode()}
              className="h-12 w-full rounded-full text-[14px] font-semibold"
            >
              {busy ? <LuLoaderCircle className="size-4 animate-spin" aria-hidden /> : "Sign in"}
            </Button>
            <button
              type="button"
              disabled={busy}
              onClick={() => getClient().login({ provider: "email", email: email.trim() })}
              className="text-center text-[12.5px] font-semibold text-muted-foreground transition-colors hover:text-foreground disabled:opacity-50"
            >
              Send a new code
            </button>
          </>
        ) : (
          <>
            <div className="flex flex-col gap-1 text-center">
              <DialogTitle className="text-[22px] font-bold tracking-[-0.03em]">
                Welcome to aygo
              </DialogTitle>
              <DialogDescription className="text-[13px] leading-snug">
                Sign in to grab your spot, message hosts and collect aygos.
              </DialogDescription>
            </div>

            <Button
              type="button"
              size="lg"
              disabled={busy}
              onClick={google}
              className="h-12 w-full gap-2.5 rounded-full text-[14px] font-semibold"
            >
              {auth.step === "opening_oauth" ? (
                <LuLoaderCircle className="size-4 animate-spin" aria-hidden />
              ) : (
                <FcGoogle className="size-5" aria-hidden />
              )}
              Continue with Google
            </Button>

            <div className="flex items-center gap-3 text-[11.5px] font-medium text-muted-foreground">
              <span className="h-px flex-1 bg-border" aria-hidden />
              or with email
              <span className="h-px flex-1 bg-border" aria-hidden />
            </div>

            <form onSubmit={sendCode} className="flex flex-col gap-2.5">
              <label className="flex h-12 items-center gap-2.5 rounded-2xl bg-card px-4 ring-1 ring-border transition-shadow focus-within:ring-2 focus-within:ring-ring">
                <LuMail className="size-4 shrink-0 text-muted-foreground" aria-hidden />
                <input
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@email.com"
                  aria-label="Email address"
                  className="h-full w-full min-w-0 bg-transparent text-[14px] text-foreground outline-none placeholder:text-muted-foreground"
                />
              </label>
              {error && <ErrorLine>{error}</ErrorLine>}
              <Button
                type="submit"
                size="lg"
                variant="outline"
                disabled={!validEmail || busy}
                className="h-12 w-full rounded-full bg-card text-[14px] font-semibold"
              >
                {auth.step === "sending_email" ? (
                  <LuLoaderCircle className="size-4 animate-spin" aria-hidden />
                ) : (
                  "Send me a code"
                )}
              </Button>
            </form>

            <ConsentNote className="mx-auto" />
          </>
        )}
      </div>
    </div>
  );
}

function ErrorLine({ children }: { children: React.ReactNode }) {
  return (
    <p role="alert" className="rounded-xl bg-destructive/10 px-3 py-2 text-[12.5px] font-medium text-destructive">
      {children}
    </p>
  );
}

/** Six one-character boxes that advance as you type and submit when full. */
function CodeBoxes({
  value,
  onChange,
  onComplete,
  disabled,
}: {
  value: string[];
  onChange: (next: string[]) => void;
  onComplete: (next: string[]) => void;
  disabled?: boolean;
}) {
  const refs = useRef<(HTMLInputElement | null)[]>([]);

  function setAt(i: number, ch: string) {
    const next = [...value];
    next[i] = ch;
    onChange(next);
    if (ch && i < value.length - 1) refs.current[i + 1]?.focus();
    if (next.every(Boolean)) onComplete(next);
  }

  function onPaste(e: React.ClipboardEvent<HTMLInputElement>) {
    const digits = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, value.length);
    if (digits.length < 2) return;
    e.preventDefault();
    const next = [...EMPTY_CODE];
    digits.split("").forEach((d, i) => (next[i] = d));
    onChange(next);
    refs.current[Math.min(digits.length, value.length) - 1]?.focus();
    if (next.every(Boolean)) onComplete(next);
  }

  return (
    <div className="grid w-full grid-cols-6 gap-1.5">
      {value.map((ch, i) => (
        <input
          key={i}
          ref={(el) => {
            refs.current[i] = el;
          }}
          value={ch}
          maxLength={1}
          autoFocus={i === 0}
          inputMode="numeric"
          autoComplete="one-time-code"
          disabled={disabled}
          aria-label={`Digit ${i + 1}`}
          onPaste={onPaste}
          onChange={(e) => setAt(i, e.target.value.replace(/\D/g, "").slice(-1))}
          onKeyDown={(e) => {
            if (e.key === "Backspace" && !value[i] && i > 0) refs.current[i - 1]?.focus();
          }}
          className={cn(
            "aspect-square w-full min-w-0 rounded-xl bg-card text-center text-[20px] font-bold text-foreground ring-1 ring-border outline-none transition-shadow focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-60",
          )}
        />
      ))}
    </div>
  );
}
