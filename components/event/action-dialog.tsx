"use client";

import { useState, type ReactNode } from "react";

import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * A secondary "muted link → modal with a note field" action, reused for both
 * Contact host and Report event. The caller supplies the icon, copy, submit
 * style and the actual `onSubmit` — the message really goes to the backend
 * (admin inbox), and the dialog closes on success.
 */
export function ActionDialog({
  label,
  icon,
  iconClassName,
  title,
  description,
  placeholder,
  helper,
  submitLabel,
  destructive = false,
  onSubmit,
}: {
  label: string;
  icon: ReactNode;
  iconClassName?: string;
  title: string;
  description: string;
  placeholder: string;
  helper?: string;
  submitLabel: string;
  destructive?: boolean;
  /** Sends the message; throw to keep the dialog open with an error. */
  onSubmit: (message: string) => Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const text = message.trim();
    if (!text || busy) return;
    setBusy(true);
    setError(null);
    try {
      await onSubmit(text);
      setMessage("");
      setOpen(false);
    } catch {
      setError("Couldn't send it — check your connection and try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className="text-[13px] font-medium text-muted-foreground transition-colors hover:text-foreground">
        {label}
      </DialogTrigger>

      <DialogContent className="gap-4">
        <div className="flex flex-col gap-3">
          <span
            className={cn(
              "grid size-11 place-items-center rounded-full",
              iconClassName ?? "bg-muted text-muted-foreground",
            )}
          >
            {icon}
          </span>
          <div>
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription className="mt-1 leading-snug">
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
            className="h-11 w-full rounded-xl text-[13.5px]"
          >
            {busy ? "Sending…" : submitLabel}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
