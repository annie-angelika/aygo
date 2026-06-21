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
  className,
}: {
  srcs: string[];
  max?: number;
  /** Real total, when larger than what's shown — drives the "+N" bubble. */
  total?: number;
  className?: string;
}) {
  const shown = srcs.slice(0, max);
  const extra = (total ?? srcs.length) - shown.length;
  return (
    <AvatarGroup className={className}>
      {shown.map((src, i) => (
        <Avatar key={i} size="sm">
          <AvatarImage src={src} alt="" />
        </Avatar>
      ))}
      {extra > 0 && (
        <AvatarGroupCount className="size-6 text-[10px]">
          +{extra}
        </AvatarGroupCount>
      )}
    </AvatarGroup>
  );
}
