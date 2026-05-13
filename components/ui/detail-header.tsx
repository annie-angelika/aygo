"use client";

import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { BackButton, MoreButton } from "@/components/ui/primitives";

/**
 * Sub-screen header: back chevron, title, optional trailing action.
 * `onBack` defaults to `router.back()` so the common case is a one-liner.
 */
export type DetailHeaderProps = {
  title: string;
  onBack?: () => void;
  trailing?: React.ReactNode;
  className?: string;
};

export function DetailHeader({
  title,
  onBack,
  trailing,
  className,
}: DetailHeaderProps) {
  const router = useRouter();
  const handleBack = onBack ?? (() => router.back());

  return (
    <header
      className={cn("flex items-center justify-between", className)}
    >
      <BackButton onClick={handleBack} />
      <h1 className="text-[15px] font-semibold text-slate-900">{title}</h1>
      {trailing ?? <MoreButton />}
    </header>
  );
}
