"use client";

import { useEffect, useRef, useState } from "react";
import {
  LuMapPin,
  LuWifi,
  LuKeyRound,
  LuQrCode,
  LuHash,
  LuLoaderCircle,
} from "react-icons/lu";
import type { IconType } from "react-icons";

import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { QrScanner } from "@/components/passport/qr-scanner";
import { AygoStar } from "@/components/ui/brand-icons";

/**
 * The screen behind each "collect" method. The way you pick a method is the
 * speed-dial in CollectFab; this just opens to the matching little step (secret
 * word, code, scanning…) and lands on a shared success state. Self-contained —
 * it celebrates the claim without touching real collection state, since there's
 * no real event behind a typed code.
 */
export type Method = "nearby" | "nfc" | "secret" | "qr" | "code";

export const METHODS: { id: Method; Icon: IconType; label: string }[] = [
  { id: "nearby", Icon: LuMapPin, label: "Find nearby" },
  { id: "nfc", Icon: LuWifi, label: "Tap an NFC tag" },
  { id: "secret", Icon: LuKeyRound, label: "Secret word" },
  { id: "qr", Icon: LuQrCode, label: "Scan a QR code" },
  { id: "code", Icon: LuHash, label: "Enter a code" },
];

const EMPTY_CODE = ["", "", "", "", "", ""];

export function CollectSheet({
  method,
  onClose,
}: {
  method: Method | null;
  onClose: () => void;
}) {
  return (
    <Dialog open={method !== null} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="gap-0 p-5">
        {/* Keyed by method so each open mounts a fresh flow (inputs reset). */}
        {method && <CollectFlow key={method} method={method} onClose={onClose} />}
      </DialogContent>
    </Dialog>
  );
}

/** One open of the collect flow: a method's step, then the shared success. */
function CollectFlow({
  method,
  onClose,
}: {
  method: Method;
  onClose: () => void;
}) {
  const [done, setDone] = useState(false);
  const [secret, setSecret] = useState("");
  const [code, setCode] = useState<string[]>(EMPTY_CODE);

  // The hands-off methods feel real: they "look" for a beat, then land on
  // success. QR is excluded — it lands on a real camera scan, not a timer.
  useEffect(() => {
    if (method !== "nearby" && method !== "nfc") return;
    const t = setTimeout(() => setDone(true), 2200);
    return () => clearTimeout(t);
  }, [method]);

  if (done) {
    return (
      <div className="flex flex-col items-center gap-3 py-2 text-center">
        <p className="text-[10.5px] font-semibold uppercase tracking-[0.1em] text-gold-deep">
          Checked in · new aygo
        </p>
        <span className="grid size-16 place-items-center rounded-full bg-gold text-navy">
          <AygoStar className="size-8" />
        </span>
        <DialogTitle className="text-[20px] font-bold tracking-[-0.03em]">
          You collected a new aygo!
        </DialogTitle>
        <DialogDescription className="max-w-[30ch] text-[13px] leading-snug">
          Nice — it&apos;s in your collection now. Keep showing up to earn more.
        </DialogDescription>
        <Button
          size="lg"
          onClick={onClose}
          className="mt-1 h-12 w-full rounded-full text-[14px] font-semibold"
        >
          Done
        </Button>
      </div>
    );
  }

  const onFinish = () => setDone(true);

  if (method === "secret") {
    return (
      <StepShell
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
        <Button
          size="lg"
          disabled={!secret.trim()}
          onClick={onFinish}
          className="h-12 w-full rounded-full text-[14px] font-semibold"
        >
          Continue
        </Button>
      </StepShell>
    );
  }

  if (method === "code") {
    return (
      <StepShell
        icon={<LuHash className="size-6" aria-hidden />}
        title="Enter a code"
        desc="Type the last six characters of your collect link."
      >
        <CodeBoxes value={code} onChange={setCode} />
        <Button
          size="lg"
          disabled={code.some((c) => !c)}
          onClick={onFinish}
          className="h-12 w-full rounded-full text-[14px] font-semibold"
        >
          Continue
        </Button>
      </StepShell>
    );
  }

  if (method === "nearby") {
    return (
      <StepShell
        icon={<LuMapPin className="size-6" aria-hidden />}
        title="Looking around you"
        desc="Hang tight — we're scanning the area for aygos nearby."
      >
        <Searching label="Scanning nearby…" />
      </StepShell>
    );
  }

  if (method === "nfc") {
    return (
      <StepShell
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
    );
  }

  return (
    <StepShell
      icon={<LuQrCode className="size-6" aria-hidden />}
      title="Point at the event's QR"
      desc="The host shows it at the door or on screen. One scan drops the aygo in your collection."
    >
      <QrScanner onScan={onFinish} />
    </StepShell>
  );
}

/** Shared layout for a single collect step: icon, title, copy, body. */
function StepShell({
  icon,
  title,
  desc,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-2.5 pt-1 text-center">
      <span className="grid size-12 place-items-center rounded-full bg-secondary text-foreground">
        {icon}
      </span>
      <DialogTitle className="text-[18px] font-bold tracking-[-0.03em]">
        {title}
      </DialogTitle>
      <DialogDescription className="max-w-[30ch] leading-snug">
        {desc}
      </DialogDescription>
      <div className="mt-1.5 flex w-full flex-col items-center gap-3">
        {children}
      </div>
    </div>
  );
}

/** A spinner + label, for the methods that look for a beat before landing. */
function Searching({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-2 text-[12.5px] font-medium text-muted-foreground">
      <LuLoaderCircle
        className="size-4 animate-spin text-gold motion-reduce:animate-none"
        aria-hidden
      />
      {label}
    </div>
  );
}

/**
 * Six single-character boxes that advance focus as you type. They flex to fit
 * the dialog width (grid, not fixed sizes) so they never overflow on narrow phones.
 */
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
          className="aspect-square w-full min-w-0 rounded-xl bg-background text-center text-[18px] font-bold uppercase text-foreground ring-1 ring-border outline-none transition-shadow focus-visible:ring-2 focus-visible:ring-ring"
        />
      ))}
    </div>
  );
}
