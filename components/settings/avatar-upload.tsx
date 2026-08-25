"use client";

import { useRef } from "react";
import { LuCamera, LuUser } from "react-icons/lu";

import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

/** Avatar with a gold camera badge — picks a REAL photo from the device. */
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
    <div className="flex items-center gap-3.5">
      <div className="relative w-fit shrink-0">
        <Avatar className="size-[72px] bg-primary text-cream">
          {src && <AvatarImage src={src} alt="" />}
          <AvatarFallback className="bg-primary text-cream">
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
          className="absolute -bottom-0.5 -right-0.5 grid size-[26px] place-items-center rounded-full bg-gold text-navy ring-2 ring-background transition-transform hover:scale-105"
        >
          <LuCamera className="size-3.5" aria-hidden />
        </button>
      </div>
      <div className="flex flex-col gap-0.5">
        <span className="text-[13px] font-semibold text-foreground">Profile photo</span>
        <span className="text-[12px] text-muted-foreground">Square, at least 400×400</span>
      </div>
    </div>
  );
}
