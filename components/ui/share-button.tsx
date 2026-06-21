"use client";

import { useState } from "react";

/**
 * Generic share trigger. Uses the Web Share API when available, else copies the
 * current URL to the clipboard and briefly swaps the label to a confirmation.
 * Pass any markup as children; the parent owns the look.
 */
export function ShareButton({
  title,
  text,
  className,
  children,
  copiedLabel = "Copied!",
}: {
  title: string;
  text: string;
  className?: string;
  children: React.ReactNode;
  copiedLabel?: string;
}) {
  const [copied, setCopied] = useState(false);

  const onClick = async () => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title, text, url });
      } catch {
        /* user dismissed — ignore */
      }
      return;
    }
    try {
      await navigator.clipboard?.writeText(`${text} ${url}`.trim());
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* clipboard blocked — ignore */
    }
  };

  return (
    <button type="button" onClick={onClick} className={className}>
      {copied ? copiedLabel : children}
    </button>
  );
}
