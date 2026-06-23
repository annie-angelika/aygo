"use client";

import { useState } from "react";
import { LuChevronsUpDown, LuShuffle } from "react-icons/lu";

import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { THEMES, type ThemeId } from "@/lib/create-event";
import { cn } from "@/lib/utils";

/** Theme name selector (opens a sheet of theme cards) + a quick shuffle button. */
export function ThemeControl({
  theme,
  onThemeChange,
}: {
  theme: ThemeId;
  onThemeChange: (id: ThemeId) => void;
}) {
  const [open, setOpen] = useState(false);
  const current = THEMES.find((t) => t.id === theme) ?? THEMES[0];

  function shuffle() {
    const i = THEMES.findIndex((t) => t.id === theme);
    onThemeChange(THEMES[(i + 1) % THEMES.length].id);
  }

  return (
    <div className="flex items-center gap-2">
      <Dialog open={open} onOpenChange={setOpen}>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="flex flex-1 items-center gap-3 rounded-2xl bg-muted px-3 py-2.5 text-left ring-1 ring-border transition-colors hover:bg-muted/70"
        >
          <span className={cn("size-9 shrink-0 rounded-lg", current.swatch)} />
          <span className="min-w-0 flex-1">
            <span className="block text-[10.5px] font-medium uppercase tracking-wider text-muted-foreground">
              Theme
            </span>
            <span className="block truncate text-[14px] font-semibold text-foreground">
              {current.name}
            </span>
          </span>
          <LuChevronsUpDown className="size-4 shrink-0 text-muted-foreground" aria-hidden />
        </button>

        <DialogContent>
          <DialogTitle>Choose a theme</DialogTitle>
          <div className="grid grid-cols-3 gap-2.5">
            {THEMES.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => {
                  onThemeChange(t.id);
                  setOpen(false);
                }}
                className={cn(
                  "rounded-2xl p-1.5 ring-2 transition-colors",
                  t.id === theme ? "ring-foreground" : "ring-border hover:ring-muted-foreground/40",
                )}
              >
                <span className={cn("block aspect-square w-full rounded-xl", t.swatch)} />
                <span className="mt-1.5 block text-center text-[12px] font-medium text-foreground">
                  {t.name}
                </span>
              </button>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-2">
            <ThemeOption label="Color" value="Custom" />
            <ThemeOption label="Style" value="—" />
            <ThemeOption label="Font" value="Ivy Presto" />
            <ThemeOption label="Display" value="Auto" />
          </div>
        </DialogContent>
      </Dialog>

      <button
        type="button"
        onClick={shuffle}
        aria-label="Shuffle theme"
        className="grid size-[52px] shrink-0 place-items-center rounded-2xl bg-muted text-muted-foreground ring-1 ring-border transition-colors hover:text-foreground"
      >
        <LuShuffle className="size-4" aria-hidden />
      </button>
    </div>
  );
}

/** A small read-only "Color / Style / Font / Display" tile, for theme fidelity. */
function ThemeOption({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-background px-3 py-2 ring-1 ring-border">
      <span className="block text-[10.5px] font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      <span className="block truncate text-[13px] font-semibold text-foreground">
        {value}
      </span>
    </div>
  );
}
