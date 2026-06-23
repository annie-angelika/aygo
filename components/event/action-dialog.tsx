"use client";

import type { ReactNode } from "react";

import {
  Dialog,
  DialogTrigger,
  DialogClose,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * A secondary "muted link → modal with a note field" action, reused for both
 * Contact host and Report event. The caller supplies the icon, copy, and submit
 * style; the shape (icon tile, title, description, textarea, full-width CTA) and
 * the gentle close-on-submit behaviour stay shared.
 */
export function ActionDialog({
  label,
  icon,
  iconClassName,
  title,
  description,
  placeholder,
  helper,
  submitLabel,
  destructive = false,
}: {
  label: string;
  icon: ReactNode;
  iconClassName?: string;
  title: string;
  description: string;
  placeholder: string;
  helper?: string;
  submitLabel: string;
  destructive?: boolean;
}) {
  return (
    <Dialog>
      <DialogTrigger className="text-[13px] font-medium text-muted-foreground transition-colors hover:text-foreground">
        {label}
      </DialogTrigger>

      <DialogContent className="gap-4">
        <div className="flex flex-col gap-3">
          <span
            className={cn(
              "grid size-11 place-items-center rounded-full",
              iconClassName ?? "bg-muted text-muted-foreground",
            )}
          >
            {icon}
          </span>
          <div>
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription className="mt-1 leading-snug">
              {description}
            </DialogDescription>
          </div>
        </div>

        <Textarea placeholder={placeholder} rows={3} />

        {helper && (
          <p className="-mt-1 text-[11.5px] leading-snug text-muted-foreground">
            {helper}
          </p>
        )}

        <DialogClose
          render={
            <Button
              variant={destructive ? "destructive" : "default"}
              className="h-11 w-full rounded-xl text-[13.5px]"
            >
              {submitLabel}
            </Button>
          }
        />
      </DialogContent>
    </Dialog>
  );
}
