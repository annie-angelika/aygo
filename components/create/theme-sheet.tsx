"use client";

import { useState } from "react";
import {
  LuChevronsUpDown,
  LuShuffle,
  LuChevronUp,
  LuChevronDown,
  LuChevronLeft,
  LuSun,
  LuMoon,
  LuCheck,
} from "react-icons/lu";

import { Sheet, SheetTrigger, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { THEMES, STYLES, getTheme, getStyle } from "@/lib/create-themes";
import { FONTS, getFont } from "@/lib/fonts";
import { cn } from "@/lib/utils";

type View = "main" | "font" | "style";

/**
 * Theme control: a pill that opens a bottom sheet with the cover themes plus
 * Color (cycles theme), Style and Font (open their own lists), and Display (a
 * light/dark toggle). Every change updates the cover — and the page — live.
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
  const [view, setView] = useState<View>("main");
  const current = getTheme(themeId);

  const cycleTheme = (delta: number) => {
    const i = THEMES.findIndex((t) => t.id === current.id);
    onThemeChange(THEMES[(i + delta + THEMES.length) % THEMES.length].id);
  };

  return (
    <div className="flex items-center gap-2">
      <Sheet
        open={open}
        onOpenChange={(o) => {
          setOpen(o);
          if (!o) setView("main");
        }}
      >
        <SheetTrigger
          render={
            <button
              type="button"
              className="flex flex-1 items-center gap-3 rounded-2xl bg-muted px-3 py-2.5 text-left ring-1 ring-border transition-colors hover:bg-muted/70"
            >
              <span className={cn("size-9 shrink-0 rounded-lg ring-1 ring-border", current.swatch)} />
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
          }
        />

        <SheetContent side="bottom" className="gap-4 px-5 pb-6 pt-2" showClose={view === "main"}>
          {view === "main" && (
            <MainView
              themeId={themeId}
              onThemeChange={onThemeChange}
              fontId={fontId}
              styleId={styleId}
              display={display}
              onToggleDisplay={onToggleDisplay}
              cycleTheme={cycleTheme}
              openFont={() => setView("font")}
              openStyle={() => setView("style")}
            />
          )}
          {view === "font" && (
            <PickerView title="Font" onBack={() => setView("main")}>
              <div className="grid grid-cols-3 gap-2.5">
                {FONTS.map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => onFontChange(f.id)}
                    className={cn(
                      "flex flex-col items-center gap-1.5 rounded-2xl py-3 ring-2 transition-colors",
                      f.id === fontId ? "ring-foreground bg-muted" : "ring-border hover:bg-muted",
                    )}
                  >
                    <span className="text-[24px] leading-none text-foreground" style={{ fontFamily: f.family }}>
                      Ag
                    </span>
                    <span className="text-[11px] font-medium text-muted-foreground">{f.name}</span>
                  </button>
                ))}
              </div>
            </PickerView>
          )}
          {view === "style" && (
            <PickerView title="Style" onBack={() => setView("main")}>
              <div className="flex flex-col gap-1">
                {STYLES.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => onStyleChange(s.id)}
                    className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-muted"
                  >
                    <span className={cn("flex-1 text-[14px] text-foreground", s.className)}>{s.name}</span>
                    {s.id === styleId && <LuCheck className="size-4 text-foreground" aria-hidden />}
                  </button>
                ))}
              </div>
            </PickerView>
          )}
        </SheetContent>
      </Sheet>

      <button
        type="button"
        onClick={() => cycleTheme(1)}
        aria-label="Shuffle theme"
        className="grid size-[52px] shrink-0 place-items-center rounded-2xl bg-muted text-muted-foreground ring-1 ring-border transition-colors hover:text-foreground"
      >
        <LuShuffle className="size-4" aria-hidden />
      </button>
    </div>
  );
}

function MainView({
  themeId,
  onThemeChange,
  fontId,
  styleId,
  display,
  onToggleDisplay,
  cycleTheme,
  openFont,
  openStyle,
}: {
  themeId: string;
  onThemeChange: (id: string) => void;
  fontId: string;
  styleId: string;
  display: "light" | "dark";
  onToggleDisplay: () => void;
  cycleTheme: (d: number) => void;
  openFont: () => void;
  openStyle: () => void;
}) {
  const current = getTheme(themeId);
  return (
    <>
      <SheetTitle className="mt-2">Theme</SheetTitle>

      <div className="-mx-5 flex gap-2.5 overflow-x-auto px-5 pb-1 no-scrollbar">
        {THEMES.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => onThemeChange(t.id)}
            className={cn(
              "shrink-0 rounded-2xl p-1.5 ring-2 transition-colors",
              t.id === themeId ? "ring-foreground" : "ring-border hover:ring-muted-foreground/40",
            )}
          >
            <span className={cn("block size-[72px] rounded-xl ring-1 ring-black/5", t.swatch)} />
            <span className="mt-1.5 block w-[72px] truncate text-center text-[11.5px] font-medium text-foreground">
              {t.name}
            </span>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-2">
        <Tile label="Color" value={current.name} onCycle={cycleTheme} />
        <Tile label="Style" value={getStyle(styleId).name} onClick={openStyle} />
        <Tile label="Font" value={getFont(fontId).name} onClick={openFont} preview="Ag" previewFont={getFont(fontId).family} />
        <Tile
          label="Display"
          value={display === "dark" ? "Dark" : "Light"}
          onClick={onToggleDisplay}
          icon={display === "dark" ? <LuMoon className="size-4 text-indigo-300" /> : <LuSun className="size-4 text-amber-500" />}
        />
      </div>
    </>
  );
}

function PickerView({
  title,
  onBack,
  children,
}: {
  title: string;
  onBack: () => void;
  children: React.ReactNode;
}) {
  return (
    <>
      <div className="mt-2 flex items-center gap-2">
        <button
          type="button"
          onClick={onBack}
          aria-label="Back"
          className="grid size-8 place-items-center rounded-full bg-muted text-muted-foreground transition-colors hover:text-foreground"
        >
          <LuChevronLeft className="size-4" aria-hidden />
        </button>
        <SheetTitle>{title}</SheetTitle>
      </div>
      <div className="max-h-[60svh] overflow-y-auto no-scrollbar">{children}</div>
    </>
  );
}

/** A "Color / Style / Font / Display" tile — cycles with arrows or opens a list. */
function Tile({
  label,
  value,
  onCycle,
  onClick,
  icon,
  preview,
  previewFont,
}: {
  label: string;
  value: string;
  onCycle?: (delta: number) => void;
  onClick?: () => void;
  icon?: React.ReactNode;
  preview?: string;
  previewFont?: string;
}) {
  const body = (
    <>
      {(icon || preview) && (
        <span className="grid size-7 shrink-0 place-items-center">
          {icon ?? (
            <span className="text-[18px] leading-none text-foreground" style={{ fontFamily: previewFont }}>
              {preview}
            </span>
          )}
        </span>
      )}
      <span className="min-w-0 flex-1 text-left">
        <span className="block text-[10.5px] font-medium uppercase tracking-wider text-muted-foreground">
          {label}
        </span>
        <span className="block truncate text-[13px] font-semibold text-foreground">{value}</span>
      </span>
    </>
  );

  if (onCycle) {
    return (
      <div className="flex items-center justify-between gap-1 rounded-xl bg-muted px-3 py-2 ring-1 ring-border">
        <span className="flex min-w-0 items-center gap-2">{body}</span>
        <span className="flex flex-col">
          <button type="button" onClick={() => onCycle(-1)} aria-label={`Previous ${label}`} className="text-muted-foreground transition-colors hover:text-foreground">
            <LuChevronUp className="size-4" aria-hidden />
          </button>
          <button type="button" onClick={() => onCycle(1)} aria-label={`Next ${label}`} className="text-muted-foreground transition-colors hover:text-foreground">
            <LuChevronDown className="size-4" aria-hidden />
          </button>
        </span>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-2 rounded-xl bg-muted px-3 py-2 text-left ring-1 ring-border transition-colors hover:bg-muted/70"
    >
      {body}
    </button>
  );
}
