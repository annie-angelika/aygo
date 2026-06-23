"use client";

import { useState } from "react";
import { LuTicket, LuUserCheck, LuArrowUpFromLine, LuPencil } from "react-icons/lu";

import { Switch } from "@/components/ui/switch";
import { CapacityDialog } from "@/components/create/capacity-dialog";
import { PaymentsDialog } from "@/components/create/payments-dialog";

/** The "Event Options" card: ticket price, approval toggle, and capacity. */
export function EventOptions({
  price,
  onPrice,
  requiresApproval,
  onApproval,
  capacity,
  onCapacity,
}: {
  price: number | null;
  onPrice: (v: number | null) => void;
  requiresApproval: boolean;
  onApproval: (v: boolean) => void;
  capacity: number | null;
  onCapacity: (v: number | null) => void;
}) {
  const [payOpen, setPayOpen] = useState(false);
  const [capOpen, setCapOpen] = useState(false);

  return (
    <div>
      <h2 className="mb-2 text-[15px] font-semibold text-foreground">Event Options</h2>
      <div className="rounded-2xl bg-muted ring-1 ring-border">
        <Row Icon={LuTicket} label="Ticket Price">
          <button
            type="button"
            onClick={() => setPayOpen(true)}
            className="flex items-center gap-1.5 text-[13px] font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            {price && price > 0 ? `Bs ${price}` : "Free"}
            <LuPencil className="size-3.5" aria-hidden />
          </button>
        </Row>
        <Divider />
        <Row Icon={LuUserCheck} label="Require Approval">
          <Switch checked={requiresApproval} onCheckedChange={onApproval} />
        </Row>
        <Divider />
        <Row Icon={LuArrowUpFromLine} label="Capacity">
          <button
            type="button"
            onClick={() => setCapOpen(true)}
            className="flex items-center gap-1.5 text-[13px] font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            {capacity != null ? capacity : "Unlimited"}
            <LuPencil className="size-3.5" aria-hidden />
          </button>
        </Row>
      </div>

      <PaymentsDialog open={payOpen} onOpenChange={setPayOpen} price={price} onConfirm={onPrice} />
      <CapacityDialog
        open={capOpen}
        onOpenChange={setCapOpen}
        capacity={capacity}
        onConfirm={onCapacity}
      />
    </div>
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
  return <div className="mx-3.5 h-px bg-border" />;
}
