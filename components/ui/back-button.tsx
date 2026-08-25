"use client";

import { useRouter } from "next/navigation";
import { LuChevronLeft } from "react-icons/lu";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/** White pill back button (shadcn Button) that pops the router. */
export function BackButton({ className }: { className?: string }) {
  const router = useRouter();
  return (
    <Button
      type="button"
      size="icon-lg"
      variant="secondary"
      aria-label="Back"
      onClick={() => router.back()}
      className={cn(
        "rounded-full bg-card text-foreground ring-1 ring-border hover:bg-muted",
        className,
      )}
    >
      <LuChevronLeft className="size-5" />
    </Button>
  );
}
