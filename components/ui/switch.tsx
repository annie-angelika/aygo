"use client";

import { Switch as SwitchPrimitive } from "@base-ui/react/switch";

import { cn } from "@/lib/utils";

/** On/off toggle, styled to the app tokens. Wraps Base UI Switch. */
function Switch({ className, ...props }: SwitchPrimitive.Root.Props) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      className={cn(
        "relative inline-flex h-6 w-10 shrink-0 cursor-pointer items-center rounded-full p-0.5 ring-1 ring-border outline-none transition-colors select-none",
        "bg-muted data-checked:bg-foreground data-checked:ring-transparent",
        "focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
        className,
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className="size-5 rounded-full bg-card shadow-sm ring-1 ring-black/5 transition-transform duration-200 data-checked:translate-x-4 data-checked:bg-background"
      />
    </SwitchPrimitive.Root>
  );
}

export { Switch };
