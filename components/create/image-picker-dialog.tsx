"use client";

import { useRef, useState } from "react";
import { LuUpload, LuSearch, LuLoaderCircle } from "react-icons/lu";

import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { STOCK_COVERS } from "@/lib/create-event";
import { fileToCover } from "@/lib/image";
import { cn } from "@/lib/utils";

const CHIPS = ["Featured", "Cup", "Sports", "Spring", "July 4th", "Climate", "Music"];

/**
 * Full-screen "Choose Image" sheet — upload your own (several at once; each is
 * downscaled client-side so nothing huge is stored), or pick a stock photo.
 * `remaining` caps how many uploads are still allowed.
 */
export function ImagePickerDialog({
  open,
  onOpenChange,
  onSelect,
  remaining = 1,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** One or more image sources, in the order picked. */
  onSelect: (srcs: string[]) => void;
  remaining?: number;
}) {
  const [active, setActive] = useState("Featured");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  function pick(srcs: string[]) {
    if (srcs.length === 0) return;
    onSelect(srcs);
    onOpenChange(false);
  }

  async function onFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? [])
      .filter((f) => f.type.startsWith("image/"))
      .slice(0, Math.max(1, remaining));
    e.target.value = ""; // let the same file be picked again later
    if (files.length === 0) return;
    setBusy(true);
    setError(null);
    // Convert one by one so a single unreadable file (e.g. HEIC on some
    // browsers) doesn't sink the rest.
    const ok: string[] = [];
    let failed = 0;
    for (const f of files) {
      try {
        ok.push(await fileToCover(f));
      } catch {
        failed++;
      }
    }
    setBusy(false);
    if (failed > 0)
      setError(
        failed === files.length
          ? "Couldn't read that photo — try a JPG or PNG."
          : `${failed} photo${failed > 1 ? "s" : ""} couldn't be read and were skipped.`,
      );
    if (ok.length > 0 && failed === 0) pick(ok);
    else if (ok.length > 0) onSelect(ok);
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="full" className="p-0">
        <div className="shrink-0 px-5 pt-7 text-center">
          <SheetTitle>Choose Image</SheetTitle>
          <SheetDescription className="mt-1">
            Upload your own, or pick a photo below.
          </SheetDescription>
        </div>

        <div className="shrink-0 space-y-3 px-5 pt-4">
          <button
            type="button"
            disabled={busy}
            onClick={() => fileRef.current?.click()}
            className="flex w-full flex-col items-center gap-1.5 rounded-2xl border border-dashed border-border bg-background py-7 text-muted-foreground transition-colors hover:bg-muted disabled:opacity-60"
          >
            {busy ? (
              <LuLoaderCircle className="size-5 animate-spin" aria-hidden />
            ) : (
              <LuUpload className="size-5" aria-hidden />
            )}
            <span className="text-[12.5px] font-medium">
              {busy
                ? "Preparing photos…"
                : remaining > 1
                  ? `Tap to upload (up to ${remaining} photos)`
                  : "Tap here to upload"}
            </span>
          </button>
          {error && (
            <p className="text-center text-[12px] font-medium text-destructive">{error}</p>
          )}
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            multiple={remaining > 1}
            onChange={onFiles}
            className="hidden"
          />

          <div className="flex items-center gap-2 rounded-xl bg-background px-3 ring-1 ring-border">
            <LuSearch className="size-4 shrink-0 text-muted-foreground" aria-hidden />
            <input
              placeholder="Search for more photos"
              className="h-10 w-full bg-transparent text-[13px] text-foreground outline-none placeholder:text-muted-foreground"
            />
          </div>

          <div className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-1 no-scrollbar">
            {CHIPS.map((chip) => (
              <button
                key={chip}
                type="button"
                onClick={() => setActive(chip)}
                className={cn(
                  "shrink-0 rounded-full px-3 py-1.5 text-[12px] font-medium transition-colors",
                  active === chip
                    ? "bg-foreground text-background"
                    : "bg-muted text-muted-foreground hover:text-foreground",
                )}
              >
                {chip}
              </button>
            ))}
          </div>
        </div>

        {/* Masonry columns so each photo shows whole, not square-cropped. */}
        <div className="flex-1 overflow-y-auto px-5 pb-6 pt-3">
          <div className="columns-2 gap-2 [&>button]:mb-2">
            {STOCK_COVERS.map((src) => (
              <button
                key={src}
                type="button"
                onClick={() => pick([src])}
                className="block w-full break-inside-avoid overflow-hidden rounded-xl ring-1 ring-border transition-transform active:scale-95"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={src} alt="" className="w-full" />
              </button>
            ))}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
