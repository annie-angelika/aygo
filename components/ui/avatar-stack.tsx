import {
  Avatar,
  AvatarImage,
  AvatarGroup,
  AvatarGroupCount,
} from "@/components/ui/avatar";

/** Overlapping row of avatars (shadcn AvatarGroup), capped with a "+N" bubble. */
export function AvatarStack({
  srcs,
  max = 3,
  total,
  size = "sm",
  className,
}: {
  srcs: string[];
  max?: number;
  /** Real total, when larger than what's shown — drives the "+N" bubble. */
  total?: number;
  size?: "sm" | "default" | "lg";
  className?: string;
}) {
  // Skip members without a photo — they still count toward the "+N" bubble.
  const shown = srcs.filter(Boolean).slice(0, max);
  const extra = (total ?? srcs.length) - shown.length;
  // The count bubble matches the avatar size; AvatarGroupCount reads the group.
  const countSize =
    size === "lg" ? "size-10 text-[11px]" : size === "default" ? "size-8 text-[11px]" : "size-6 text-[10px]";
  return (
    <AvatarGroup className={className}>
      {shown.map((src, i) => (
        <Avatar key={i} size={size}>
          <AvatarImage src={src} alt="" />
        </Avatar>
      ))}
      {extra > 0 && (
        <AvatarGroupCount className={countSize}>+{extra}</AvatarGroupCount>
      )}
    </AvatarGroup>
  );
}
