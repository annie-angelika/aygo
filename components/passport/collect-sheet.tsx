"use client";

import { useEffect, useRef, useState } from "react";
import {
  LuMapPin,
  LuWifi,
  LuKeyRound,
  LuQrCode,
  LuHash,
  LuChevronRight,
  LuChevronLeft,
  LuCheck,
  LuLoaderCircle,
} from "react-icons/lu";
import type { IconType } from "react-icons";

import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

/**
 * The "Collect" flow: a single dialog that steps from a menu of ways to claim an
 * aygo (find nearby, NFC, secret word, QR, code) into the matching little screen,
 * then a shared success state. Self-contained — it celebrates the claim without
 * touching real collection state, since there's no real event behind a typed code.
 */
type Method = "nearby" | "nfc" | "secret" | "qr" | "code";
type Step = "menu" | Method | "success";

const METHODS: { id: Method; Icon: IconType; label: string; hint: string }[] = [
  { id: "nearby", Icon: LuMapPin, label: "Find nearby", hint: "Scan around you for aygos" },
  { id: "nfc", Icon: LuWifi, label: "Tap an NFC tag", hint: "Hold your phone to the tag" },
  { id: "secret", Icon: LuKeyRound, label: "Secret word", hint: "Got a word from the host?" },
  { id: "qr", Icon: LuQrCode, label: "Scan a QR code", hint: "Point your camera at it" },
  { id: "code", Icon: LuHash, label: "Enter a code", hint: "Type the code from your link" },
];

const EMPTY_CODE = ["", "", "", "", "", ""];

export function CollectSheet({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [step, setStep] = useState<Step>("menu");
  const [secret, setSecret] = useState("");
  const [code, setCode] = useState<string[]>(EMPTY_CODE);

  const reset = () => {
    setStep("menu");
    setSecret("");
    setCode(EMPTY_CODE);
  };

  const back = () => {
    setSecret("");
    setCode(EMPTY_CODE);
    setStep("menu");
  };

  // The hands-off methods feel real: they "look" for a beat, then land on success.
  useEffect(() => {
    if (step !== "nearby" && step !== "nfc" && step !== "qr") return;
    const t = setTimeout(() => setStep("success"), 2200);
    return () => clearTimeout(t);
  }, [step]);

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        onOpenChange(o);
        if (!o) reset();
      }}
    >
      <DialogContent className="gap-0 p-5">
        {step === "menu" && (
          <div className="flex flex-col">
            <DialogTitle className="text-[17px]">Collect an aygo</DialogTitle>
            <DialogDescription className="mt-1">
              Pick how you got your hands on it.
            </DialogDescription>

            <div className="-mx-1.5 mt-3 flex flex-col">
              {METHODS.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setStep(m.id)}
                  className="flex items-center gap-3 rounded-xl px-1.5 py-2.5 text-left transition-colors hover:bg-muted"
                >
                  <span className="grid size-9 shrink-0 place-items-center rounded-full bg-amber-50 text-amber-600 ring-1 ring-amber-100">
                    <m.Icon className="size-[18px]" aria-hidden />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[13.5px] font-semibold text-foreground">
                      {m.label}
                    </span>
                    <span className="block truncate text-[11.5px] text-muted-foreground">
                      {m.hint}
                    </span>
                  </span>
                  <LuChevronRight
                    className="size-4 shrink-0 text-muted-foreground/70"
                    aria-hidden
                  />
                </button>
              ))}
            </div>
          </div>
        )}

        {step === "secret" && (
          <StepShell
            onBack={back}
            icon={<LuKeyRound className="size-6" aria-hidden />}
            title="Secret word"
            desc="Enter the secret word the host shared at the event."
          >
            <Input
              autoFocus
              value={secret}
              onChange={(e) => setSecret(e.target.value)}
              placeholder="Your secret word"
              className="h-10 text-center text-[14px]"
            />
            <PrimaryButton
              disabled={!secret.trim()}
              onClick={() => setStep("success")}
            >
              Continue
            </PrimaryButton>
          </StepShell>
        )}

        {step === "code" && (
          <StepShell
            onBack={back}
            icon={<LuHash className="size-6" aria-hidden />}
            title="Enter a code"
            desc="Type the last six characters of your collect link."
          >
            <CodeBoxes value={code} onChange={setCode} />
            <PrimaryButton
              disabled={code.some((c) => !c)}
              onClick={() => setStep("success")}
            >
              Continue
            </PrimaryButton>
          </StepShell>
        )}

        {step === "nearby" && (
          <StepShell
            onBack={back}
            icon={<LuMapPin className="size-6" aria-hidden />}
            title="Looking around you"
            desc="Hang tight — we're scanning the area for aygos nearby."
          >
            <Searching label="Scanning nearby…" />
          </StepShell>
        )}

        {step === "nfc" && (
          <StepShell
            onBack={back}
            icon={
              <LuWifi
                className="size-6 animate-pulse motion-reduce:animate-none"
                aria-hidden
              />
            }
            title="Hold near the tag"
            desc="Keep the top of your phone against the NFC tag."
          >
            <Searching label="Waiting for a tag…" />
          </StepShell>
        )}

        {step === "qr" && (
          <StepShell
            onBack={back}
            icon={<LuQrCode className="size-6" aria-hidden />}
            title="Scan the QR code"
            desc="Point your camera at the event's QR code."
          >
            <QrViewport />
          </StepShell>
        )}

        {step === "success" && (
          <div className="flex flex-col items-center gap-3 py-2 text-center">
            <span className="grid size-16 place-items-center rounded-full bg-emerald-100 text-emerald-600 ring-1 ring-emerald-200">
              <LuCheck className="size-8" aria-hidden />
            </span>
            <DialogTitle className="text-[18px]">
              You collected a new aygo!
            </DialogTitle>
            <DialogDescription className="max-w-[30ch]">
              Nice — it&apos;s in your collection now. Keep showing up to earn
              more.
            </DialogDescription>
            <PrimaryButton onClick={() => onOpenChange(false)}>
              Done
            </PrimaryButton>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

/** Shared layout for a single collect step: back arrow, icon, title, copy, body. */
function StepShell({
  onBack,
  icon,
  title,
  desc,
  children,
}: {
  onBack: () => void;
  icon: React.ReactNode;
  title: string;
  desc: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-2.5 pt-1 text-center">
      <button
        type="button"
        onClick={onBack}
        aria-label="Back"
        className="absolute left-3.5 top-3.5 grid size-8 place-items-center rounded-full bg-muted/60 text-muted-foreground backdrop-blur transition-colors hover:text-foreground"
      >
        <LuChevronLeft className="size-4" aria-hidden />
      </button>
      <span className="grid size-12 place-items-center rounded-full bg-amber-50 text-amber-600 ring-1 ring-amber-100">
        {icon}
      </span>
      <DialogTitle className="text-[16px]">{title}</DialogTitle>
      <DialogDescription className="max-w-[30ch] leading-snug">
        {desc}
      </DialogDescription>
      <div className="mt-1.5 flex w-full flex-col items-center gap-3">
        {children}
      </div>
    </div>
  );
}

/** Near-black pill, the app's primary action — full width to anchor a step. */
function PrimaryButton({
  children,
  disabled,
  onClick,
}: {
  children: React.ReactNode;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "inline-flex h-10 w-full items-center justify-center rounded-full px-5 text-[14px] font-semibold transition-colors",
        disabled
          ? "pointer-events-none bg-muted text-muted-foreground"
          : "bg-primary text-primary-foreground shadow-[0_12px_24px_-12px_rgba(15,23,42,0.5)] hover:bg-primary/90 active:translate-y-px",
      )}
    >
      {children}
    </button>
  );
}

/** A spinner + label, for the methods that look for a beat before landing. */
function Searching({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-2 text-[12.5px] font-medium text-muted-foreground">
      <LuLoaderCircle
        className="size-4 animate-spin text-amber-500 motion-reduce:animate-none"
        aria-hidden
      />
      {label}
    </div>
  );
}

/** A camera viewport mock with corner brackets and a sweeping scan line. */
function QrViewport() {
  return (
    <div className="relative grid size-40 place-items-center overflow-hidden rounded-2xl bg-slate-900/90">
      <LuQrCode className="size-20 text-white/15" aria-hidden />
      {/* Corner brackets. */}
      {[
        "left-3 top-3 border-l-2 border-t-2",
        "right-3 top-3 border-r-2 border-t-2",
        "left-3 bottom-3 border-l-2 border-b-2",
        "right-3 bottom-3 border-r-2 border-b-2",
      ].map((pos) => (
        <span
          key={pos}
          aria-hidden
          className={cn("absolute size-6 rounded-[3px] border-amber-400", pos)}
        />
      ))}
      <span
        aria-hidden
        className="absolute inset-x-5 h-0.5 rounded bg-amber-400 shadow-[0_0_12px_2px_rgba(251,191,36,0.6)] animate-[aygo-scan_1.8s_ease-in-out_infinite] motion-reduce:hidden"
      />
    </div>
  );
}

/** Six single-character boxes that advance focus as you type. */
function CodeBoxes({
  value,
  onChange,
}: {
  value: string[];
  onChange: (next: string[]) => void;
}) {
  const refs = useRef<(HTMLInputElement | null)[]>([]);

  const setAt = (i: number, ch: string) => {
    const next = [...value];
    next[i] = ch;
    onChange(next);
  };

  return (
    <div className="flex gap-2">
      {value.map((ch, i) => (
        <input
          key={i}
          ref={(el) => {
            refs.current[i] = el;
          }}
          value={ch}
          maxLength={1}
          autoFocus={i === 0}
          inputMode="text"
          aria-label={`Character ${i + 1}`}
          onChange={(e) => {
            const c = e.target.value.slice(-1).toUpperCase();
            setAt(i, c);
            if (c && i < value.length - 1) refs.current[i + 1]?.focus();
          }}
          onKeyDown={(e) => {
            if (e.key === "Backspace" && !value[i] && i > 0)
              refs.current[i - 1]?.focus();
          }}
          className="size-11 rounded-xl bg-background text-center text-[18px] font-bold uppercase text-foreground ring-1 ring-border outline-none transition-shadow focus-visible:ring-2 focus-visible:ring-ring"
        />
      ))}
    </div>
  );
}
