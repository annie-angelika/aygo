"use client";

import { useState } from "react";
import { LuChevronsUpDown, LuShuffle } from "react-icons/lu";

import { Sheet, SheetTrigger, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { ThemeSwatch } from "@/components/create/theme-swatch";
import { THEMES, getTheme } from "@/lib/create-themes";
import { cn } from "@/lib/utils";

/**
 * Theme control: a pill that opens a bottom sheet of cover themes, plus a
 * shuffle button that steps to the next one. A theme carries its own font,
 * style and tone (see lib/create-themes) — there are no per-field overrides.
 */
export function ThemeSheet({
  themeId,
  onThemeChange,
}: {
  themeId: string;
  onThemeChange: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const current = getTheme(themeId);

  const cycleTheme = (delta: number) => {
    const i = THEMES.findIndex((t) => t.id === current.id);
    onThemeChange(THEMES[(i + delta + THEMES.length) % THEMES.length].id);
  };

  return (
    <div className="flex items-center gap-2">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger
          render={
            <button
              type="button"
              className="flex flex-1 items-center gap-3 rounded-2xl bg-card px-3 py-2.5 text-left ring-1 ring-border transition-colors hover:bg-muted/40"
            >
              <ThemeSwatch theme={current} detailed={false} className="size-9 shrink-0 rounded-[10px] ring-1 ring-border" />
              <span className="min-w-0 flex-1">
                <span className="block text-[10.5px] font-medium uppercase tracking-[0.08em] text-muted-foreground">
                  Theme
                </span>
                <span className="block truncate text-[14px] font-semibold text-foreground">
                  {current.name}
                </span>
              </span>
              <LuChevronsUpDown className="size-4 shrink-0 text-muted-foreground" aria-hidden />
            </button>
          }
        />

        <SheetContent side="bottom" className="gap-5 px-5 pb-7 pt-2" showClose={false}>
          <SheetTitle className="sr-only">Theme</SheetTitle>

          <div className="-mx-5 flex gap-3 overflow-x-auto px-5 pb-1 pt-1 no-scrollbar">
            {THEMES.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => onThemeChange(t.id)}
                className="flex shrink-0 flex-col items-center gap-2"
              >
                {/* The selection ring wraps only the swatch — the name sits below it. */}
                <span
                  className={cn(
                    "rounded-2xl p-1 ring-2 transition-colors",
                    t.id === themeId ? "ring-gold" : "ring-transparent",
                  )}
                >
                  <ThemeSwatch theme={t} className="size-[72px] rounded-xl ring-1 ring-foreground/8" />
                </span>
                <span className="w-[80px] truncate text-center text-[11.5px] font-medium text-foreground">
                  {t.name}
                </span>
              </button>
            ))}
          </div>
        </SheetContent>
      </Sheet>

      <button
        type="button"
        onClick={() => cycleTheme(1)}
        aria-label="Shuffle theme"
        className="grid size-[52px] shrink-0 place-items-center rounded-2xl bg-card text-muted-foreground ring-1 ring-border transition-colors hover:text-foreground"
      >
        <LuShuffle className="size-4" aria-hidden />
      </button>
    </div>
  );
}
