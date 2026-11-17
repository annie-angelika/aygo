"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { LuCheck, LuSend } from "react-icons/lu";

import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { ApiError } from "@/lib/api";
import { cn } from "@/lib/utils";

/**
 * A secondary "muted link → modal with a note field" action, reused for both
 * Contact host and Report event. The caller supplies the icon, copy, submit
 * style and the actual `onSubmit`. On success the modal turns into a
 * confirmation (with a link to /inbox where the thread lives) instead of
 * silently vanishing. `trigger` swaps the muted text link for any element.
 */
export function ActionDialog({
  label,
  trigger,
  icon,
  iconClassName,
  title,
  description,
  placeholder,
  helper,
  submitLabel,
  destructive = false,
  successTitle,
  successBody,
  defaultMessage = "",
  onSubmit,
}: {
  label: string;
  trigger?: ReactNode;
  icon: ReactNode;
  iconClassName?: string;
  title: string;
  description: string;
  placeholder: string;
  helper?: string;
  submitLabel: string;
  destructive?: boolean;
  successTitle: string;
  successBody: string;
  defaultMessage?: string;
  /** Sends the message; throw to keep the dialog open with an error. */
  onSubmit: (message: string) => Promise<unknown>;
}) {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState(defaultMessage);
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (!next) {
      setSent(false);
      setError(null);
      setMessage(defaultMessage);
    }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const text = message.trim();
    if (!text || busy) return;
    setBusy(true);
    setError(null);
    try {
      await onSubmit(text);
      setSent(true);
    } catch (err) {
      setError(
        err instanceof ApiError && err.status >= 400 && err.status < 500
          ? err.message
          : "Couldn't send it — check your connection and try again.",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      {trigger ? (
        <DialogTrigger render={trigger as React.ReactElement} />
      ) : (
        <DialogTrigger className="text-[13px] font-medium text-muted-foreground transition-colors hover:text-foreground">
          {label}
        </DialogTrigger>
      )}

      <DialogContent className="gap-4 bg-background">
        {sent ? (
          <div className="flex flex-col items-center gap-3 py-2 text-center">
            <span className="grid size-14 place-items-center rounded-full bg-gold text-navy">
              <LuCheck className="size-7" strokeWidth={2.5} aria-hidden />
            </span>
            <div>
              <DialogTitle className="text-[18px] font-bold tracking-[-0.03em]">
                {successTitle}
              </DialogTitle>
              <DialogDescription className="mt-1 text-[13px] leading-snug">
                {successBody}
              </DialogDescription>
            </div>
            <Button
              nativeButton={false}
              render={<Link href="/inbox?tab=messages" />}
              variant="outline"
              className="h-10 rounded-full bg-card px-5 text-[13px] font-semibold ring-1 ring-border"
            >
              Open my inbox
            </Button>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-3 pr-10">
              <span
                className={cn(
                  "grid size-11 shrink-0 place-items-center rounded-full",
                  iconClassName ?? "bg-secondary text-foreground",
                )}
              >
                {icon}
              </span>
              <div className="min-w-0 flex-1">
                <DialogTitle className="text-[18px] font-bold leading-[1.15] tracking-[-0.03em]">
                  {title}
                </DialogTitle>
                <DialogDescription className="mt-0.5 text-[12px] leading-snug">
                  {description}
                </DialogDescription>
              </div>
            </div>

            <form onSubmit={submit} className="flex flex-col gap-4">
              <Textarea
                placeholder={placeholder}
                rows={3}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="rounded-[14px] bg-card"
              />

              {helper && (
                <p className="-mt-1 text-[11.5px] leading-snug text-muted-foreground">
                  {helper}
                </p>
              )}
              {error && (
                <p className="-mt-1 text-[12px] font-medium text-destructive">
                  {error}
                </p>
              )}

              <Button
                type="submit"
                disabled={!message.trim() || busy}
                variant={destructive ? "destructive" : "default"}
                className="h-12 w-full rounded-full text-[14px] font-semibold"
              >
                {busy ? "Sending…" : submitLabel}
                {!destructive && <LuSend className="size-4 text-gold" aria-hidden />}
              </Button>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
