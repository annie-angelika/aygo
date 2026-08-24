import { LuBellOff } from "react-icons/lu";

import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { NotificationRow } from "@/components/inbox/notification-row";
import type { AppNotification } from "@/types";

export function NotificationList({
  items,
  loading,
}: {
  items: AppNotification[];
  loading: boolean;
}) {
  if (loading && items.length === 0) {
    return (
      <div className="flex flex-col gap-2">
        {[0, 1, 2].map((i) => (
          <Skeleton key={i} className="h-16 rounded-2xl" />
        ))}
      </div>
    );
  }
  if (items.length === 0) {
    return (
      <EmptyState
        icon={LuBellOff}
        title="Nothing yet"
        subtitle="When someone registers for your event, or a host answers you, it shows up here."
      />
    );
  }
  return (
    <div className="overflow-hidden rounded-2xl bg-card ring-1 ring-border">
      {items.map((n, i) => (
        <div key={n.id} className={i > 0 ? "border-t border-border" : ""}>
          <NotificationRow item={n} />
        </div>
      ))}
    </div>
  );
}
