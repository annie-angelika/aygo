"use client";

import { useState } from "react";
import { LuSend } from "react-icons/lu";

import { Button } from "@/components/ui/button";
import { ApiError } from "@/lib/api";

/** Compact one-line reply pill with a navy send button, send state and an inline error. */
export function ReplyForm({
  onSubmit,
  placeholder,
}: {
  onSubmit: (message: string) => Promise<void>;
  placeholder: string;
}) {
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    const msg = text.trim();
    if (!msg || busy) return;
    setBusy(true);
    setError(null);
    try {
      await onSubmit(msg);
      setText("");
    } catch (err) {
      setError(
        err instanceof ApiError && err.status >= 400 && err.status < 500
          ? err.message
          : "Couldn't send — check your connection and try again.",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={send} className="flex flex-col gap-1.5">
      <div className="flex items-center gap-2">
        <div className="flex h-11 min-w-0 flex-1 items-center rounded-full bg-card px-3.5 ring-1 ring-border transition-shadow focus-within:ring-2 focus-within:ring-ring">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={placeholder}
            aria-label={placeholder}
            className="h-full w-full bg-transparent text-[13px] text-foreground outline-none placeholder:text-muted-foreground"
          />
        </div>
        <Button
          type="submit"
          size="icon"
          aria-label="Send reply"
          disabled={!text.trim() || busy}
          className="size-11 shrink-0 rounded-full text-gold"
        >
          <LuSend className="size-[18px]" />
        </Button>
      </div>
      {error && <p className="text-[11.5px] font-medium text-destructive">{error}</p>}
    </form>
  );
}
