"use client";

import { useRef, useState } from "react";
import { LuUpload, LuLoaderCircle } from "react-icons/lu";

import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { fileToCover } from "@/lib/image";

/**
 * Full-screen "Choose Image" sheet — upload your own photo (downscaled
 * client-side so nothing huge is stored). No stock photos: without a photo the
 * event's THEME is its cover.
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
            One square photo. Without one, your theme is the cover.
          </SheetDescription>
        </div>

        <div className="shrink-0 space-y-3 px-5 pt-4">
          <button
            type="button"
            disabled={busy}
            onClick={() => fileRef.current?.click()}
            className="flex w-full flex-col items-center gap-1.5 rounded-2xl border border-dashed border-border bg-card py-7 text-muted-foreground transition-colors hover:bg-secondary/60 disabled:opacity-60"
          >
            {busy ? (
              <LuLoaderCircle className="size-5 animate-spin" aria-hidden />
            ) : (
              <LuUpload className="size-5" aria-hidden />
            )}
            <span className="text-[12.5px] font-medium">
              {busy ? "Preparing photo…" : "Tap here to upload a photo"}
            </span>
          </button>
          {error && (
            <p className="text-center text-[12px] font-medium text-destructive">{error}</p>
          )}
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            onChange={onFiles}
            className="hidden"
          />

        </div>

      </SheetContent>
    </Sheet>
  );
}
