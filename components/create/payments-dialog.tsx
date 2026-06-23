"use client";

import { useState } from "react";
import { LuTicket, LuQrCode, LuCreditCard, LuChevronRight, LuChevronLeft } from "react-icons/lu";
import type { IconType } from "react-icons";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type Step = "intro" | "price";

const METHODS: { id: string; Icon: IconType; label: string; hint: string }[] = [
  { id: "qr", Icon: LuQrCode, label: "QR (Pago Móvil)", hint: "Cobrá con QR Simple o pago móvil" },
  { id: "gateway", Icon: LuCreditCard, label: "Payment gateway", hint: "Tarjeta de crédito o débito" },
];

/**
 * "Accept Payments" modal. The calendar isn't set up to charge yet, so you first
 * pick how you'll collect money — a QR (pago móvil) or a card payment gateway —
 * then set the ticket price. (aygo uses local rails, not Stripe.)
 */
export function PaymentsDialog({
  open,
  onOpenChange,
  price,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  price: number | null;
  onConfirm: (price: number | null) => void;
}) {
  const [step, setStep] = useState<Step>("intro");
  const [method, setMethod] = useState<string | null>(null);
  const [value, setValue] = useState(price ? String(price) : "");

  function close(next: boolean) {
    onOpenChange(next);
    if (!next) {
      setStep("intro");
      setMethod(null);
    }
  }

  function confirm() {
    const n = Number(value);
    onConfirm(n > 0 ? n : null);
    close(false);
  }

  return (
    <Dialog open={open} onOpenChange={close}>
      <DialogContent className="max-w-sm">
        <span
          className={cn(
            "grid size-12 place-items-center rounded-full bg-muted text-foreground",
            step === "price" && "mx-auto",
          )}
        >
          <LuTicket className="size-5" aria-hidden />
        </span>

        {step === "intro" ? (
          <>
            <div>
              <DialogTitle className="text-[18px]">Accept Payments</DialogTitle>
              <DialogDescription className="mt-1.5">
                This calendar is not yet set up to accept payments. Choose how
                you&apos;ll collect money to start selling tickets — it takes less
                than 5 minutes.
              </DialogDescription>
            </div>

            <div className="flex flex-col gap-2">
              {METHODS.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => {
                    setMethod(m.id);
                    setStep("price");
                  }}
                  className="flex items-center gap-3 rounded-2xl bg-background px-3 py-2.5 text-left ring-1 ring-border transition-colors hover:bg-muted active:translate-y-px"
                >
                  <span className="grid size-10 shrink-0 place-items-center rounded-full bg-muted text-foreground">
                    <m.Icon className="size-5" aria-hidden />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[13.5px] font-semibold text-foreground">
                      {m.label}
                    </span>
                    <span className="block truncate text-[11.5px] text-muted-foreground">
                      {m.hint}
                    </span>
                  </span>
                  <LuChevronRight className="size-4 shrink-0 text-muted-foreground" aria-hidden />
                </button>
              ))}
            </div>
          </>
        ) : (
          <>
            <button
              type="button"
              onClick={() => setStep("intro")}
              aria-label="Back"
              className="absolute left-3.5 top-3.5 grid size-8 place-items-center rounded-full bg-muted/60 text-muted-foreground backdrop-blur transition-colors hover:text-foreground"
            >
              <LuChevronLeft className="size-4" aria-hidden />
            </button>
            <div>
              <DialogTitle className="text-[18px]">Ticket Price</DialogTitle>
              <DialogDescription className="mt-1.5">
                Collecting via{" "}
                {METHODS.find((m) => m.id === method)?.label}. Set the price
                guests pay per ticket.
              </DialogDescription>
            </div>

            <div className="flex items-center gap-2 rounded-xl bg-background px-3 ring-1 ring-border">
              <span className="text-[13px] font-semibold text-muted-foreground">Bs</span>
              <Input
                type="number"
                min={0}
                autoFocus
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="0"
                className="h-11 bg-transparent px-0 text-[15px] font-semibold ring-0 focus-visible:ring-0"
              />
            </div>

            <Button size="lg" onClick={confirm} className="h-12 w-full rounded-full text-[14px]">
              Confirm
            </Button>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
