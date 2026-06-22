import { cn } from "@/lib/utils";

/** Generic single-line text field, styled to the app's input tokens. */
function Input({ className, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      data-slot="input"
      className={cn(
        "h-9 w-full rounded-xl bg-background px-3 text-[13px] text-foreground ring-1 ring-border outline-none transition-shadow placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring",
        className,
      )}
      {...props}
    />
  );
}

export { Input };
