"use client";

import { useState } from "react";
import { LuTicket, LuUserCheck, LuArrowUpFromLine, LuPencil } from "react-icons/lu";

import { Switch } from "@/components/ui/switch";
import { CapacityDialog } from "@/components/create/capacity-dialog";
import { PriceDialog, type PriceSettings } from "@/components/create/price-dialog";
import { WalletSetupNote } from "@/components/payment/wallet-setup-note";
import { formatWhatsapp } from "@/lib/payment";

/** The "Event Options" card: ticket price (paid to the host directly), approval
 * toggle, and capacity. */
export function EventOptions({
  pricing,
  onPricing,
  requiresApproval,
  onApproval,
  capacity,
  onCapacity,
}: {
  pricing: PriceSettings;
  onPricing: (v: PriceSettings) => void;
  requiresApproval: boolean;
  onApproval: (v: boolean) => void;
  capacity: number | null;
  onCapacity: (v: number | null) => void;
}) {
  const [capOpen, setCapOpen] = useState(false);
  const [priceOpen, setPriceOpen] = useState(false);

  return (
    <div>
      <h2 className="mb-2 text-[15px] font-semibold text-foreground">Event Options</h2>
      <div className="rounded-2xl bg-card ring-1 ring-border">
        <Row Icon={LuTicket} label="Ticket Price">
          <EditButton onClick={() => setPriceOpen(true)}>
            {pricing.price != null && pricing.price > 0
              ? `Bs ${pricing.price} · ${
                  pricing.payWallet
                    ? "in the app"
                    : pricing.payWhatsapp
                    ? formatWhatsapp(pricing.payWhatsapp)
                    : pricing.payLink
                      ? "link"
                      : "no way to pay!"
                }`
              : "Free"}
          </EditButton>
        </Row>
        {pricing.price != null && pricing.price > 0 && pricing.payWallet && (
          <div className="px-3.5 pb-3">
            <WalletSetupNote wallet={pricing.payWallet} />
          </div>
        )}
        <Divider />
        <Row Icon={LuUserCheck} label="Require Approval">
          <Switch checked={requiresApproval} onCheckedChange={onApproval} />
        </Row>
        <Divider />
        <Row Icon={LuArrowUpFromLine} label="Capacity">
          <EditButton onClick={() => setCapOpen(true)}>
            {capacity != null ? capacity : "Unlimited"}
          </EditButton>
        </Row>
      </div>

      <CapacityDialog
        open={capOpen}
        onOpenChange={setCapOpen}
        capacity={capacity}
        onConfirm={onCapacity}
      />
      {/* Keyed so reopening picks up the latest value. */}
      <PriceDialog
        key={`${priceOpen}-${pricing.price ?? "free"}`}
        open={priceOpen}
        onOpenChange={setPriceOpen}
        value={pricing}
        onConfirm={onPricing}
      />
    </div>
  );
}

function EditButton({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-1.5 text-[13px] font-medium text-muted-foreground transition-colors hover:text-foreground"
    >
      {children}
      <LuPencil className="size-3.5" aria-hidden />
    </button>
  );
}

function Row({
  Icon,
  label,
  children,
}: {
  Icon: typeof LuTicket;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-3 px-3.5 py-3">
      <Icon className="size-[18px] shrink-0 text-muted-foreground" aria-hidden />
      <span className="flex-1 text-[14px] font-medium text-foreground">{label}</span>
      {children}
    </div>
  );
}

function Divider() {
  return <div className="mx-3 h-px bg-border" />;
}
