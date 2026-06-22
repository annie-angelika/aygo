import { cn } from "@/lib/utils";

/** Generic multi-line text field, styled to the app's input tokens. */
function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "min-h-20 w-full resize-none rounded-xl bg-background px-3 py-2 text-[13px] leading-snug text-foreground ring-1 ring-border outline-none transition-shadow placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring",
        className,
      )}
      {...props}
    />
  );
}

export { Textarea };
