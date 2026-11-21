// One guest/applicant line in the manage lists: identity + when + an action.

import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { initials, realAvatar } from "@/lib/utils";
import { formatUsdc, txExplorerUrl } from "@/lib/stellar";
import type { GuestRow as GuestRowData } from "@/lib/api/manage";

export function GuestRow({
  guest,
  subtitle,
  action,
}: {
  guest: GuestRowData;
  /** Extra line under the name (e.g. the applicant's note). */
  subtitle?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-3 px-3.5 py-2.5">
      <Avatar className="size-9 shrink-0">
        {realAvatar(guest.avatar) && (
          <AvatarImage src={realAvatar(guest.avatar)} alt={guest.name} />
        )}
        <AvatarFallback>{initials(guest.name)}</AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[13.5px] font-semibold text-foreground">
          {guest.name}
        </p>
        <p className="truncate text-[11.5px] text-muted-foreground">
          {[guest.username && `@${guest.username}`, subtitle ?? new Date(guest.at).toLocaleDateString()]
            .filter(Boolean)
            .join(" · ")}
        </p>
      </div>
      {guest.payment && (
        <a
          href={txExplorerUrl(guest.payment.txHash)}
          target="_blank"
          rel="noreferrer"
          title="Paid in the app — open the receipt"
          className="inline-flex h-[22px] shrink-0 items-center rounded-full bg-gold px-2 text-[11px] font-bold text-navy"
        >
          Paid · {formatUsdc(guest.payment.amount)} USDC
        </a>
      )}
      {action}
    </div>
  );
}
