"use client";

import { useRef } from "react";
import { LuArrowUp, LuUser } from "react-icons/lu";

import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

/** Avatar with a corner upload button — picks a REAL photo from the device. */
export function AvatarUpload({
  src,
  onSelect,
}: {
  src: string;
  /** Called with the picked image file; the parent stores the processed result. */
  onSelect: (file: File) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-[12px] font-semibold text-foreground">
        Profile Picture
      </span>
      <div className="relative w-fit">
        <Avatar className="size-20 ring-1 ring-border">
          {src && <AvatarImage src={src} alt="" />}
          <AvatarFallback>
            <LuUser className="size-8" aria-hidden />
          </AvatarFallback>
        </Avatar>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) onSelect(file);
            e.target.value = ""; // allow re-picking the same file
          }}
        />
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          aria-label="Upload photo"
          className="absolute -bottom-1 -right-1 grid size-8 place-items-center rounded-full bg-foreground text-background ring-2 ring-background transition-transform hover:scale-105"
        >
          <LuArrowUp className="size-4" aria-hidden />
        </button>
      </div>
    </div>
  );
}
