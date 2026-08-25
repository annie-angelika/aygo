"use client";

import * as React from "react";
import { useState } from "react";
import { LuChevronsUpDown, LuShuffle, LuSun, LuMoon, LuCheck } from "react-icons/lu";

import { Sheet, SheetTrigger, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { Popover, PopoverTrigger, PopoverContent, PopoverClose } from "@/components/ui/popover";
import { ThemeSwatch } from "@/components/create/theme-swatch";
import { THEMES, STYLES, getTheme, getStyle } from "@/lib/create-themes";
import { FONTS, getFont } from "@/lib/fonts";
import { cn } from "@/lib/utils";

/**
 * Theme control: a pill that opens a bottom sheet of cover themes. Color, Style
 * and Font each open an inline popover anchored to their tile (no view swap —
 * the picker shows in-place over the same sheet); Display is a light/dark toggle.
 */
export function ThemeSheet({
  themeId,
  onThemeChange,
  fontId,
  onFontChange,
  styleId,
  onStyleChange,
  display,
  onToggleDisplay,
}: {
  themeId: string;
  onThemeChange: (id: string) => void;
  fontId: string;
  onFontChange: (id: string) => void;
  styleId: string;
  onStyleChange: (id: string) => void;
  display: "light" | "dark";
  onToggleDisplay: () => void;
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

          <div className="grid grid-cols-2 gap-2">
            <ColorTile themeId={themeId} onThemeChange={onThemeChange} />
            <StyleTile styleId={styleId} onStyleChange={onStyleChange} />
            <FontTile fontId={fontId} onFontChange={onFontChange} />
            <DisplayTile display={display} onToggle={onToggleDisplay} />
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

/* ---- Tiles ---- */

/**
 * The shared tile surface (icon/preview + label + value + a "opens picker" cue).
 * forwardRef + prop spread so Base UI's PopoverTrigger can wire its click/state
 * handlers onto the real <button>.
 */
const TileButton = React.forwardRef<
  HTMLButtonElement,
  { label: string; value: string; leading?: React.ReactNode } & React.ComponentProps<"button">
>(function TileButton({ label, value, leading, className, ...props }, ref) {
  return (
    <button
      ref={ref}
      type="button"
      className={cn(
        "flex w-full items-center gap-2 rounded-xl bg-secondary px-3 py-2.5 text-left transition-colors hover:bg-navy-soft/70 data-popup-open:bg-navy-soft/70",
        className,
      )}
      {...props}
    >
      {leading && <span className="grid size-7 shrink-0 place-items-center">{leading}</span>}
      <span className="min-w-0 flex-1">
        <span className="block text-[10.5px] font-medium uppercase tracking-[0.08em] text-muted-foreground">
          {label}
        </span>
        <span className="block truncate text-[13px] font-semibold text-foreground">{value}</span>
      </span>
      <LuChevronsUpDown className="size-4 shrink-0 text-muted-foreground" aria-hidden />
    </button>
  );
});

function ColorTile({
  themeId,
  onThemeChange,
}: {
  themeId: string;
  onThemeChange: (id: string) => void;
}) {
  return (
    <Popover>
      <PopoverTrigger
        render={<TileButton label="Color" value={getTheme(themeId).name} leading={<span className={cn("size-5 rounded-full ring-1 ring-black/10", getTheme(themeId).swatch)} />} />}
      />
      <PopoverContent side="top" align="start" sideOffset={10} initialFocus={false} className="w-[248px] p-2.5">
        <div className="flex flex-wrap gap-2.5">
          {THEMES.map((t) => (
            <PopoverClose
              key={t.id}
              render={
                <button
                  type="button"
                  onClick={() => onThemeChange(t.id)}
                  aria-label={t.name}
                  className={cn(
                    "size-8 rounded-full ring-2 ring-offset-2 ring-offset-card transition-transform active:scale-95",
                    t.swatch,
                    t.id === themeId ? "ring-gold" : "ring-transparent",
                  )}
                />
              }
            />
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}

function StyleTile({
  styleId,
  onStyleChange,
}: {
  styleId: string;
  onStyleChange: (id: string) => void;
}) {
  return (
    <Popover>
      <PopoverTrigger render={<TileButton label="Style" value={getStyle(styleId).name} />} />
      <PopoverContent side="top" align="start" sideOffset={10} initialFocus={false} className="w-[200px] p-1.5">
        {STYLES.map((s) => (
          <PopoverClose
            key={s.id}
            render={
              <button
                type="button"
                onClick={() => onStyleChange(s.id)}
                className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left transition-colors hover:bg-muted"
              >
                <span className={cn("flex-1 text-[13.5px] text-foreground", s.className)}>{s.name}</span>
                {s.id === styleId && <LuCheck className="size-4 shrink-0 text-foreground" aria-hidden />}
              </button>
            }
          />
        ))}
      </PopoverContent>
    </Popover>
  );
}

function FontTile({
  fontId,
  onFontChange,
}: {
  fontId: string;
  onFontChange: (id: string) => void;
}) {
  const font = getFont(fontId);
  return (
    <Popover>
      <PopoverTrigger
        render={
          <TileButton
            label="Font"
            value={font.name}
            leading={
              <span className="text-[18px] leading-none text-foreground" style={{ fontFamily: font.family }}>
                Ag
              </span>
            }
          />
        }
      />
      <PopoverContent side="top" align="start" sideOffset={10} initialFocus={false} className="w-[288px] p-2.5">
        <div className="grid grid-cols-3 gap-2.5">
          {FONTS.map((f) => (
            <PopoverClose
              key={f.id}
              render={
                <button
                  type="button"
                  onClick={() => onFontChange(f.id)}
                  className={cn(
                    "flex flex-col items-center gap-1 rounded-xl py-3 ring-2 transition-colors",
                    f.id === fontId ? "bg-secondary ring-gold" : "bg-secondary/50 ring-transparent hover:bg-secondary",
                  )}
                >
                  <span className="text-[22px] leading-none text-foreground" style={{ fontFamily: f.family }}>
                    Ag
                  </span>
                  <span className="text-[10.5px] font-medium text-muted-foreground">{f.name}</span>
                </button>
              }
            />
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}

function DisplayTile({
  display,
  onToggle,
}: {
  display: "light" | "dark";
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="flex items-center gap-2 rounded-xl bg-secondary px-3 py-2.5 text-left transition-colors hover:bg-navy-soft/70"
    >
      <span className="grid size-7 shrink-0 place-items-center">
        {display === "dark" ? (
          <LuMoon className="size-4 text-foreground" aria-hidden />
        ) : (
          <LuSun className="size-4 text-gold" aria-hidden />
        )}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[10.5px] font-medium uppercase tracking-[0.08em] text-muted-foreground">
          Display
        </span>
        <span className="block truncate text-[13px] font-semibold text-foreground">
          {display === "dark" ? "Dark" : "Light"}
        </span>
      </span>
    </button>
  );
}
