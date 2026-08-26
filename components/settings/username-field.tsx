"use client";

import { useEffect, useState } from "react";
import { LuCheck, LuLoaderCircle, LuX } from "react-icons/lu";

import { Input } from "@/components/ui/input";
import { checkUsername } from "@/lib/api";
import { normalizeUsername, usernameProblem, USERNAME_MAX } from "@/lib/username";
import { cn } from "@/lib/utils";

export type UsernameStatus =
  | { kind: "idle" }
  | { kind: "checking" }
  | { kind: "invalid"; reason: string }
  | { kind: "taken" }
  | { kind: "available" }
  | { kind: "current" };

/** What the shared rules say before asking the server. */
function localStatus(normalized: string, current?: string | null): UsernameStatus {
  if (!normalized) return { kind: "idle" };
  if (normalized === current) return { kind: "current" };
  const problem = usernameProblem(normalized);
  return problem ? { kind: "invalid", reason: problem } : { kind: "checking" };
}

/**
 * The "@handle" input with live availability: normalizes as you type, applies
 * the shared rules instantly and asks the server (debounced) whether the
 * handle is free. `current` is the handle you already hold — typing it back
 * reads as "that's yours". Reports every status change up so the parent can
 * gate its Save button.
 */
export function UsernameField({
  value,
  onChange,
  current,
  onStatus,
  autoFocus,
  className,
}: {
  value: string;
  onChange: (value: string) => void;
  current?: string | null;
  onStatus?: (status: UsernameStatus) => void;
  autoFocus?: boolean;
  className?: string;
}) {
  const normalized = normalizeUsername(value);
  // The server's verdict for one specific handle; stale answers are ignored
  // by comparing `for` with what's typed now.
  const [remote, setRemote] = useState<{ for: string; status: UsernameStatus } | null>(null);
  const local = localStatus(normalized, current);
  const status: UsernameStatus =
    local.kind === "checking" && remote?.for === normalized ? remote.status : local;

  useEffect(() => {
    if (local.kind !== "checking" || remote?.for === normalized) return;
    const controller = new AbortController();
    const timer = setTimeout(() => {
      checkUsername(normalized, controller.signal)
        .then(({ available }) =>
          setRemote({ for: normalized, status: { kind: available ? "available" : "taken" } }),
        )
        .catch((e: unknown) => {
          if (controller.signal.aborted) return;
          setRemote({
            for: normalized,
            status: {
              kind: "invalid",
              reason: e instanceof Error && e.message ? e.message : "Couldn't check that name.",
            },
          });
        });
    }, 350);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [normalized, local.kind, remote?.for]);

  // Tell the parent whenever the verdict changes (its setter is stable).
  const statusKey = `${status.kind}:${normalized}`;
  useEffect(() => {
    onStatus?.(status);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusKey]);

  const hint =
    status.kind === "invalid"
      ? status.reason
      : status.kind === "taken"
        ? "Already taken — try another."
        : status.kind === "available"
          ? "Available."
          : status.kind === "current"
            ? "That's your current username."
            : "Letters, numbers, dots and underscores. 3–24 characters.";
  const bad = status.kind === "invalid" || status.kind === "taken";

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <div className="relative flex items-center overflow-hidden rounded-xl bg-card ring-1 ring-border focus-within:ring-2 focus-within:ring-ring">
        <span className="grid h-10 w-10 shrink-0 place-items-center bg-secondary text-[13px] text-muted-foreground">
          @
        </span>
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value.slice(0, USERNAME_MAX + 1))}
          placeholder="your.name"
          autoFocus={autoFocus}
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          aria-label="Username"
          aria-invalid={bad}
          className="h-10 rounded-none border-0 bg-transparent pr-9 shadow-none ring-0 focus-visible:ring-0"
        />
        <span className="absolute right-3 grid place-items-center" aria-hidden>
          {status.kind === "checking" && (
            <LuLoaderCircle className="size-4 animate-spin text-muted-foreground" />
          )}
          {(status.kind === "available" || status.kind === "current") && (
            <LuCheck className="size-4 text-gold-deep" strokeWidth={2.5} />
          )}
          {bad && <LuX className="size-4 text-destructive" strokeWidth={2.5} />}
        </span>
      </div>
      <p className={cn("text-[11px]", bad ? "text-destructive" : "text-muted-foreground")}>{hint}</p>
    </div>
  );
}
