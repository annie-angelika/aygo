"use client";

import { useState } from "react";
import { LuTicket, LuLink, LuCheck, LuQrCode } from "react-icons/lu";
import { FaWhatsapp } from "react-icons/fa6";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useUsdcWallet } from "@/hooks/use-usdc-wallet";
import { normalizeWhatsapp } from "@/lib/payment";

export type PriceSettings = {
  price: number | null;
  payWhatsapp?: string;
  payLink?: string;
  /** Your wallet — set when guests can pay in the app. */
  payWallet?: string;
};

/**
 * "Ticket Price" modal. A paid event must say HOW guests pay: in the app
 * (bank QR → USDC in the host's own wallet), a WhatsApp number (guests open a
 * chat to arrange a QR/transfer) and/or a payment link — it won't confirm
 * until at least one is set.
 */
export function PriceDialog({
  open,
  onOpenChange,
  value,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  value: PriceSettings;
  onConfirm: (next: PriceSettings) => void;
}) {
  const isPaid = value.price != null && value.price > 0;
  const [paid, setPaid] = useState(isPaid);
  const [amount, setAmount] = useState(isPaid ? String(value.price) : "50");
  const [whatsapp, setWhatsapp] = useState(value.payWhatsapp ?? "");
  const [link, setLink] = useState(value.payLink ?? "");
  const { address } = useUsdcWallet();
  const [inApp, setInApp] = useState(!!value.payWallet);
  // Keep a wallet already saved on the event; otherwise it's the signed-in host's.
  const wallet = inApp ? (value.payWallet ?? address ?? undefined) : undefined;

  const n = Number(amount);
  const amountOk = Number.isFinite(n) && n > 0;
  const waDigits = normalizeWhatsapp(whatsapp);
  const waOk = whatsapp.trim() === "" || waDigits !== null;
  const linkTrim = link.trim();
  const linkOk = linkTrim === "" || /^(https?:\/\/)?[^\s]+\.[^\s]{2,}$/i.test(linkTrim);
  const hasChannel = !!wallet || !!waDigits || (linkTrim !== "" && linkOk);
  const canConfirm = !paid || (amountOk && waOk && linkOk && hasChannel);

  function confirm() {
    if (!canConfirm) return;
    onConfirm(
      paid
        ? {
            price: Math.round(n * 100) / 100,
            payWhatsapp: waDigits ?? undefined,
            payLink: linkTrim ? (/^https?:\/\//i.test(linkTrim) ? linkTrim : `https://${linkTrim}`) : undefined,
            payWallet: wallet,
          }
        : { price: null },
    );
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <span className="grid size-12 place-items-center rounded-full bg-primary text-gold">
          <LuTicket className="size-5" aria-hidden />
        </span>
        <div>
          <DialogTitle className="text-[18px]">Ticket Price</DialogTitle>
          <DialogDescription className="mt-1.5">
            Guests pay you directly. Take it in the app by bank QR, or tell
            them where: a WhatsApp number, a payment link.
          </DialogDescription>
        </div>

        <div className="flex items-center justify-between gap-3">
          <span className="text-[14px] font-medium text-foreground">Paid event</span>
          <Switch checked={paid} onCheckedChange={setPaid} />
        </div>

        {paid && (
          <div className="flex flex-col gap-3">
            <label className="flex flex-col gap-1.5">
              <span className="text-[12px] font-semibold text-foreground">Price</span>
              <div className="flex items-center gap-2">
                <span className="text-[14px] font-semibold text-muted-foreground">Bs</span>
                <Input
                  type="number"
                  min={1}
                  step="0.5"
                  inputMode="decimal"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Price"
                  className="h-11"
                />
              </div>
            </label>

            <div className="flex flex-col gap-1.5 rounded-xl bg-muted/40 p-3">
              <div className="flex items-center justify-between gap-3">
                <span className="flex items-center gap-1.5 text-[12.5px] font-semibold text-foreground">
                  <LuQrCode className="size-3.5" aria-hidden />
                  Get paid in the app
                </span>
                <Switch
                  checked={inApp}
                  onCheckedChange={setInApp}
                  disabled={!address && !value.payWallet}
                />
              </div>
              <span className="text-[11px] leading-snug text-muted-foreground">
                {address || value.payWallet
                  ? "Guests pay by bank QR and it lands in your aygo wallet as USDC (digital dollars), confirmed automatically. Cash out to your bank from Wallet in your profile menu."
                  : "Sign out and back in to use this — your wallet isn't loaded."}
              </span>
            </div>

            <label className="flex flex-col gap-1.5">
              <span className="flex items-center gap-1.5 text-[12px] font-semibold text-foreground">
                <FaWhatsapp className="size-3.5 text-emerald-600" aria-hidden />
                WhatsApp to get paid
              </span>
              <Input
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                placeholder="+591 71234567"
                aria-invalid={!waOk}
                className="h-11"
              />
              <span className="text-[11px] leading-snug text-muted-foreground">
                Guests open a chat with you to send a QR or transfer. 8 digits = Bolivia.
              </span>
            </label>

            <label className="flex flex-col gap-1.5">
              <span className="flex items-center gap-1.5 text-[12px] font-semibold text-foreground">
                <LuLink className="size-3.5" aria-hidden />
                Payment link{" "}
                <span className="font-medium text-muted-foreground">(optional)</span>
              </span>
              <Input
                type="url"
                inputMode="url"
                value={link}
                onChange={(e) => setLink(e.target.value)}
                placeholder="https://…"
                aria-invalid={!linkOk}
                className="h-11"
              />
            </label>

            {!hasChannel ? (
              <p className="text-[12px] font-medium text-amber-700">
                Turn on in-app payments, or add a WhatsApp number or a link — otherwise guests can&apos;t pay you.
              </p>
            ) : (
              <p className="inline-flex items-center gap-1 text-[12px] font-medium text-emerald-700">
                <LuCheck className="size-3.5" aria-hidden />
                Guests will see how to pay right after reserving.
              </p>
            )}
          </div>
        )}

        <Button
          size="lg"
          onClick={confirm}
          disabled={!canConfirm}
          className="h-12 w-full rounded-full text-[14px] font-semibold"
        >
          Confirm
        </Button>
      </DialogContent>
    </Dialog>
  );
}
