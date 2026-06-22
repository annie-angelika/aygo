import { LuArrowUp } from "react-icons/lu";

import { Avatar, AvatarImage } from "@/components/ui/avatar";

/** Avatar with a corner upload button (swaps in a new photo on click). */
export function AvatarUpload({
  src,
  onChange,
}: {
  src: string;
  onChange: () => void;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-[12px] font-semibold text-foreground">
        Profile Picture
      </span>
      <div className="relative w-fit">
        <Avatar className="size-20 ring-1 ring-border">
          <AvatarImage src={src} alt="" />
        </Avatar>
        <button
          type="button"
          onClick={onChange}
          aria-label="Change photo"
          className="absolute -bottom-1 -right-1 grid size-8 place-items-center rounded-full bg-foreground text-background ring-2 ring-background transition-transform hover:scale-105"
        >
          <LuArrowUp className="size-4" aria-hidden />
        </button>
      </div>
    </div>
  );
}
