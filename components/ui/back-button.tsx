"use client";

import { useRouter } from "next/navigation";
import { LuChevronLeft } from "react-icons/lu";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/** Frosted back button (shadcn Button) that pops the router. */
export function BackButton({ className }: { className?: string }) {
  const router = useRouter();
  return (
    <Button
      type="button"
      size="icon"
      variant="secondary"
      aria-label="Back"
      onClick={() => router.back()}
      className={cn("rounded-full bg-background/80 backdrop-blur", className)}
    >
      <LuChevronLeft className="size-5" />
    </Button>
  );
}
