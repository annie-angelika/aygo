"use client";

import { useState } from "react";

/**
 * Generic share trigger. Uses the Web Share API when available, else copies the
 * URL to the clipboard and briefly swaps the label to a confirmation. Shares
 * the current page unless `url` (absolute or site-relative) is given.
 * Pass any markup as children; the parent owns the look.
 */
export function ShareButton({
  title,
  text,
  url: target,
  className,
  children,
  copiedLabel = "Copied!",
}: {
  title: string;
  text: string;
  /** Page to share instead of the current one, e.g. "/q0gdufts". */
  url?: string;
  className?: string;
  children: React.ReactNode;
  copiedLabel?: string;
}) {
  const [copied, setCopied] = useState(false);

  const onClick = async () => {
    if (typeof window === "undefined") return;
    const url = target ? new URL(target, window.location.origin).href : window.location.href;
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
