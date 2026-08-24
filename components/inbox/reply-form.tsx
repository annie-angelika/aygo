"use client";

import { useState } from "react";
import { LuSend } from "react-icons/lu";

import { Button } from "@/components/ui/button";
import { ApiError } from "@/lib/api";

/** Compact one-line reply box with send state and an inline error. */
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
        err instanceof ApiError && err.status === 400
          ? err.message
          : "Couldn't send — check your connection and try again.",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={send} className="flex flex-col gap-1.5">
      <div className="flex items-center gap-2 rounded-xl bg-background px-3 ring-1 ring-border focus-within:ring-2 focus-within:ring-ring">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={placeholder}
          aria-label={placeholder}
          className="h-10 w-full bg-transparent text-[13px] text-foreground outline-none placeholder:text-muted-foreground"
        />
        <Button
          type="submit"
          size="icon"
          variant="ghost"
          aria-label="Send reply"
          disabled={!text.trim() || busy}
          className="size-8 rounded-full"
        >
          <LuSend className="size-4" />
        </Button>
      </div>
      {error && <p className="text-[11.5px] font-medium text-destructive">{error}</p>}
    </form>
  );
}
