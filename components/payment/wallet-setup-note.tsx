"use client";

// Shown to a host who turned on in-app payments: their wallet has to accept
// USDC before a guest can pay it. Lives OUTSIDE dialogs on purpose — Pollar
// asks for approval in its own window.

import { LuCheck } from "react-icons/lu";

import { Button } from "@/components/ui/button";
import { useUsdcWallet } from "@/hooks/use-usdc-wallet";

export function WalletSetupNote({ wallet }: { wallet?: string }) {
  const { address, trusted, busy, error, enable } = useUsdcWallet();
  // Only the wallet's owner can set it up (an admin editing sees nothing).
  if (!wallet || wallet !== address || trusted == null) return null;

  if (trusted) {
    return (
      <p className="inline-flex items-center gap-1 text-[12px] font-medium text-emerald-700">
        <LuCheck className="size-3.5" aria-hidden />
        Your wallet is ready to receive payments.
      </p>
    );
  }
  return (
    <div className="flex flex-col gap-2 rounded-xl bg-gold-soft p-3">
      <p className="text-[12px] font-medium leading-snug text-foreground">
        One step left: let your wallet receive USDC. Until then guests can&apos;t pay you in the app.
      </p>
      <Button
        type="button"
        size="sm"
        onClick={enable}
        disabled={busy}
        className="h-9 self-start rounded-full px-4 text-[12.5px] font-semibold"
      >
        {busy ? "Setting up…" : "Set up my wallet"}
      </Button>
      {error && (
        <p role="alert" className="text-[11.5px] font-medium text-amber-700">
          {error}
        </p>
      )}
    </div>
  );
}
