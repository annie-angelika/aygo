"use client";

import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import { LuX } from "react-icons/lu";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const Dialog = DialogPrimitive.Root;
const DialogTrigger = DialogPrimitive.Trigger;
const DialogClose = DialogPrimitive.Close;

function DialogContent({
  className,
  children,
  ...props
}: DialogPrimitive.Popup.Props) {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Backdrop className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0" />
      <DialogPrimitive.Popup
        data-slot="dialog-content"
        className={cn(
          // `[&>*]:min-w-0` is load-bearing: the popup is a grid, and grid items
          // default to `min-width: auto`, so a `truncate` (white-space: nowrap)
          // child reports its full text as min-content and blows the popup past
          // the viewport instead of truncating. Letting children shrink to 0 lets
          // truncation/scroll actually take effect at narrow widths.
          "fixed left-1/2 top-1/2 z-50 grid w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 gap-4 rounded-3xl bg-card p-5 shadow-[0_24px_60px_-24px_rgba(15,23,42,0.45)] ring-1 ring-border duration-150 [&>*]:min-w-0 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95",
          className,
        )}
        {...props}
      >
        {children}
        <DialogPrimitive.Close
          aria-label="Close"
          render={
            <Button
              type="button"
              variant="secondary"
              size="icon"
              className="absolute right-3.5 top-3.5 rounded-full bg-card/90 text-muted-foreground ring-1 ring-border backdrop-blur transition-colors hover:bg-muted hover:text-foreground"
            >
              <LuX className="size-4" />
            </Button>
          }
        />
      </DialogPrimitive.Popup>
    </DialogPrimitive.Portal>
  );
}

function DialogTitle({ className, ...props }: DialogPrimitive.Title.Props) {
  return (
    <DialogPrimitive.Title
      data-slot="dialog-title"
      className={cn(
        "text-[16px] font-semibold tracking-tight text-foreground",
        className,
      )}
      {...props}
    />
  );
}

function DialogDescription({
  className,
  ...props
}: DialogPrimitive.Description.Props) {
  return (
    <DialogPrimitive.Description
      data-slot="dialog-description"
      className={cn("text-[12.5px] text-muted-foreground", className)}
      {...props}
    />
  );
}

export {
  Dialog,
  DialogTrigger,
  DialogClose,
  DialogContent,
  DialogTitle,
  DialogDescription,
};
