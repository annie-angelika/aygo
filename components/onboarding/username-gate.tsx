"use client";

// Every account needs a public handle. Right after sign-in, while the server
// says this session has none, a dialog you can't dismiss asks for one —
// prefilled from the social login's name — and saves it before the app goes
// on. Reads the SERVER's answer (not the local cache) so a returning person
// on a fresh browser never sees it again.

import { useState } from "react";
import { LuAtSign } from "react-icons/lu";
import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";

import { Button } from "@/components/ui/button";
import { UsernameField, type UsernameStatus } from "@/components/settings/username-field";
import { useAsyncData } from "@/hooks/use-async-data";
import { useAuth } from "@/hooks/use-auth";
import { useMe } from "@/hooks/use-me";
import { fetchProfile, setUsername, ApiError } from "@/lib/api";
import { STORAGE_KEYS, readStorage, writeStorage } from "@/lib/storage";
import { suggestUsername } from "@/lib/username";
import type { ProfileEdits } from "@/types";

export function UsernameGate() {
  const { isAuthenticated, email } = useAuth();
  const { me } = useMe();
  const { data: server, loading, refetch } = useAsyncData(
    (signal) => fetchProfile(signal),
    [],
    { cacheKey: "me-profile", enabled: isAuthenticated },
  );
  const [done, setDone] = useState(false);

  // Only once the server has answered "no username" — never on a guess.
  const needed = isAuthenticated && !loading && server !== undefined && !server.username && !done;
  if (!needed) return null;

  return (
    <UsernamePicker
      suggestion={suggestUsername(server?.name ?? me.name, email)}
      onSaved={(username) => {
        // Mirror into the local profile so every surface shows it instantly.
        const local = readStorage<Partial<ProfileEdits>>(STORAGE_KEYS.profile, {});
        writeStorage(STORAGE_KEYS.profile, { ...local, username });
        setDone(true);
        refetch();
      }}
    />
  );
}

function UsernamePicker({
  suggestion,
  onSaved,
}: {
  suggestion: string;
  onSaved: (username: string) => void;
}) {
  const [value, setValue] = useState(suggestion);
  const [status, setStatus] = useState<UsernameStatus>({ kind: "idle" });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const ready = status.kind === "available" && !busy;

  async function save() {
    if (!ready) return;
    setBusy(true);
    setError(null);
    try {
      onSaved(await setUsername(value));
    } catch (e) {
      setError(
        e instanceof ApiError && e.status < 500
          ? e.message
          : "Couldn't save that — try again.",
      );
      setBusy(false);
    }
  }

  return (
    // Controlled and always open: outside presses can't dismiss it and the
    // Escape key is ignored (onOpenChange never flips our state).
    <DialogPrimitive.Root open modal disablePointerDismissal onOpenChange={() => {}}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Backdrop className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm" />
        <DialogPrimitive.Popup className="fixed left-1/2 top-1/2 z-50 grid max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 gap-4 overflow-y-auto rounded-3xl bg-card p-5 shadow-[0_24px_60px_-24px_rgba(15,23,42,0.45)] ring-1 ring-border [&>*]:min-w-0">
          <div className="flex flex-col items-center gap-2.5 pt-1 text-center">
            <span className="grid size-12 place-items-center rounded-full bg-gold-soft text-gold-deep">
              <LuAtSign className="size-6" aria-hidden />
            </span>
            <DialogPrimitive.Title className="text-[18px] font-bold tracking-[-0.03em] text-foreground">
              Pick your username
            </DialogPrimitive.Title>
            <DialogPrimitive.Description className="max-w-[32ch] text-[12.5px] leading-snug text-muted-foreground">
              It&apos;s how hosts and friends find you — your profile lives at
              aygo/u/<span className="font-semibold text-foreground">{value ? value.toLowerCase() : "…"}</span>.
              You can change it later in Settings.
            </DialogPrimitive.Description>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              void save();
            }}
            className="flex flex-col gap-3"
          >
            <UsernameField value={value} onChange={setValue} onStatus={setStatus} autoFocus />
            {error && (
              <p role="alert" className="rounded-xl bg-destructive/10 px-3 py-2 text-center text-[12.5px] font-medium text-destructive">
                {error}
              </p>
            )}
            <Button
              type="submit"
              size="lg"
              disabled={!ready}
              className="h-12 w-full rounded-full text-[14px] font-semibold"
            >
              {busy ? "Saving…" : "Continue"}
            </Button>
          </form>
        </DialogPrimitive.Popup>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
