"use client";

import { useRef, useState } from "react";
import { LuUpload, LuLoaderCircle, LuCamera } from "react-icons/lu";

import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { fileToCover } from "@/lib/image";

/**
 * Full-screen "Choose Image" sheet — upload your own photos (downscaled and
 * size-capped client-side so nothing huge is stored). No stock photos: without
 * a photo the event's THEME is its cover. `remaining` is how many more photos
 * the event can take (see MAX_IMAGES); the picker never hands back more.
 */
export function ImagePickerDialog({
  open,
  onOpenChange,
  onSelect,
  remaining,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** One or more image sources, in the order picked. */
  onSelect: (srcs: string[]) => void;
  remaining: number;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  // A separate single-file input with `capture`: Android's chooser offers the
  // camera only for a single capture, so the multi-select "upload" input
  // alone leaves phones with the gallery and nothing else.
  const cameraRef = useRef<HTMLInputElement>(null);

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
    // Whatever was readable is handed over; the sheet stays open only to show
    // the error for the ones that weren't.
    if (ok.length > 0 && failed === 0) pick(ok);
    else if (ok.length > 0) onSelect(ok);
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="full" className="p-0">
        <div className="shrink-0 px-5 pt-7 text-center">
          <SheetTitle>Choose Image</SheetTitle>
          <SheetDescription className="mt-1">
            {remaining > 1
              ? `Up to ${remaining} more photos — the first is the cover.`
              : "One more photo. Without one, your theme is the cover."}
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
              {busy ? "Preparing photos…" : "Choose from your photos"}
            </span>
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => cameraRef.current?.click()}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-card text-[13.5px] font-semibold text-foreground ring-1 ring-border transition-colors hover:bg-muted disabled:opacity-60"
          >
            <LuCamera className="size-4" aria-hidden />
            Take a photo
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
          <input
            ref={cameraRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={onFiles}
            className="hidden"
          />

        </div>

      </SheetContent>
    </Sheet>
  );
}
