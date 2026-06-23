"use client";

import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import { LuX } from "react-icons/lu";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * A sheet (drawer-style modal) built on Base UI Dialog + CSS transitions — no
 * motion library. `side="bottom"` slides up anchored to the bottom edge;
 * `side="full"` is a full-screen panel that also slides up.
 */
const Sheet = DialogPrimitive.Root;
const SheetTrigger = DialogPrimitive.Trigger;
const SheetClose = DialogPrimitive.Close;

function SheetContent({
  className,
  children,
  side = "bottom",
  showClose = true,
  ...props
}: DialogPrimitive.Popup.Props & {
  side?: "bottom" | "full";
  showClose?: boolean;
}) {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Backdrop className="fixed inset-0 z-50 bg-black/50 duration-300 data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0" />
      <DialogPrimitive.Popup
        data-slot="sheet-content"
        className={cn(
          "fixed inset-x-0 z-50 mx-auto flex w-full max-w-md flex-col bg-card text-foreground duration-300 [&>*]:min-w-0",
          "data-open:animate-in data-open:slide-in-from-bottom data-closed:animate-out data-closed:slide-out-to-bottom",
          side === "bottom"
            ? "bottom-0 max-h-[88svh] rounded-t-3xl pb-[max(env(safe-area-inset-bottom),1rem)] shadow-[0_-24px_60px_-24px_rgba(0,0,0,0.6)]"
            : "inset-y-0 h-svh max-h-svh",
          className,
        )}
        {...props}
      >
        {side === "bottom" && (
          <div
            aria-hidden
            className="mx-auto mt-3 h-1.5 w-10 shrink-0 rounded-full bg-muted-foreground/30"
          />
        )}
        {children}
        {showClose && (
          <DialogPrimitive.Close
            aria-label="Close"
            render={
              <Button
                type="button"
                variant="secondary"
                size="icon"
                className="absolute right-3.5 top-3.5 rounded-full bg-muted/60 text-muted-foreground backdrop-blur transition-colors hover:text-foreground"
              >
                <LuX className="size-4" />
              </Button>
            }
          />
        )}
      </DialogPrimitive.Popup>
    </DialogPrimitive.Portal>
  );
}

function SheetTitle({ className, ...props }: DialogPrimitive.Title.Props) {
  return (
    <DialogPrimitive.Title
      data-slot="sheet-title"
      className={cn("text-[16px] font-semibold tracking-tight text-foreground", className)}
      {...props}
    />
  );
}

function SheetDescription({ className, ...props }: DialogPrimitive.Description.Props) {
  return (
    <DialogPrimitive.Description
      data-slot="sheet-description"
      className={cn("text-[12.5px] text-muted-foreground", className)}
      {...props}
    />
  );
}

export { Sheet, SheetTrigger, SheetClose, SheetContent, SheetTitle, SheetDescription };
