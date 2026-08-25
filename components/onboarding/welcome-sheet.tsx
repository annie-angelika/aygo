"use client";

// First-run welcome: three short slides on how aygo works, ending with a
// taste picker (interests + city) that feeds "For you". Shown once per device
// (localStorage flag); "Skip" is always available.

import { useState } from "react";
import { LuCompass, LuTicket, LuStamp, LuSparkles } from "react-icons/lu";
import type { IconType } from "react-icons";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { TasteSettings } from "@/components/settings/taste-settings";
import { useStorageValue, useHydrated } from "@/hooks/use-storage";
import { STORAGE_KEYS, writeStorage } from "@/lib/storage";
import { cn } from "@/lib/utils";

const STEPS: { Icon: IconType; title: string; body: string }[] = [
  {
    Icon: LuCompass,
    title: "Welcome to aygo",
    body: "Find what's happening around you — parties, music, food, hikes — and see who's going before you commit.",
  },
  {
    Icon: LuTicket,
    title: "Grab your spot",
    body: "Tap “Get your spot” on any event. Some hosts approve requests; you'll get a notification the moment they answer.",
  },
  {
    Icon: LuStamp,
    title: "Collect every experience",
    body: "Check in when you attend and earn an aygo stamp for your passport. Host your own events from the Create button.",
  },
  {
    Icon: LuSparkles,
    title: "Make it yours",
    body: "Pick what you're into and your city — the plans you'll like most float to the top of Discover.",
  },
];

export function WelcomeSheet() {
  const hydrated = useHydrated();
  const seen = useStorageValue<boolean>(STORAGE_KEYS.onboarded, false);
  const [step, setStep] = useState(0);
  const [dismissed, setDismissed] = useState(false);

  if (!hydrated || seen || dismissed) return null;

  const done = () => {
    writeStorage(STORAGE_KEYS.onboarded, true);
    setDismissed(true);
  };
  const last = step === STEPS.length - 1;
  const { Icon, title, body } = STEPS[step];

  return (
    <Sheet open onOpenChange={(o) => !o && done()}>
      <SheetContent className="gap-5 overflow-hidden px-6 pt-4">
        <div className="flex flex-col items-center gap-3 text-center">
          <span className="grid size-14 place-items-center rounded-full bg-gold-soft text-gold-deep">
            <Icon className="size-7" aria-hidden />
          </span>
          <div>
            <SheetTitle className="text-[20px]">{title}</SheetTitle>
            <SheetDescription className="mx-auto mt-1.5 max-w-[30ch] text-[13.5px] leading-snug">
              {body}
            </SheetDescription>
          </div>
        </div>

        {last && (
          <div className="min-h-0 flex-1 overflow-y-auto">
            <TasteSettings compact />
          </div>
        )}

        <div className="flex items-center justify-center gap-1.5" aria-hidden>
          {STEPS.map((_, i) => (
            <span
              key={i}
              className={cn(
                "h-1.5 rounded-full transition-all",
                i === step ? "w-5 bg-foreground" : "w-1.5 bg-muted-foreground/30",
              )}
            />
          ))}
        </div>

        <div className="flex flex-col gap-2">
          <Button
            size="lg"
            onClick={() => (last ? done() : setStep((s) => s + 1))}
            className="h-12 w-full rounded-full text-[14px]"
          >
            {last ? "Start exploring" : "Next"}
          </Button>
          {!last && (
            <Button variant="ghost" onClick={done} className="h-10 rounded-full text-[13px] text-muted-foreground">
              Skip
            </Button>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
