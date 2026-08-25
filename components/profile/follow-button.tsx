"use client";

import { useState } from "react";
import { LuCheck, LuPlus } from "react-icons/lu";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";

/** Follow / Following toggle for another traveler's profile. */
export function FollowButton({ initial = false }: { initial?: boolean }) {
  const [following, setFollowing] = useState(initial);
  const { isAuthenticated, openLoginModal } = useAuth();

  // Following someone needs an identity — signed-out taps open the login modal
  // instead, and the toggle only flips once you're in.
  function handleClick() {
    if (!isAuthenticated) {
      openLoginModal();
      return;
    }
    setFollowing((f) => !f);
  }

  return (
    <Button
      onClick={handleClick}
      variant={following ? "outline" : "default"}
      aria-label={following ? "Following" : "Follow"}
      className={cn(
        "h-9 w-full rounded-full text-[13px] font-semibold",
        following && "border-0 bg-card ring-1 ring-border",
      )}
    >
      {following ? (
        <>
          <LuCheck className="size-4" aria-hidden />
          Following
        </>
      ) : (
        <>
          <LuPlus className="size-4" aria-hidden />
          Follow
        </>
      )}
    </Button>
  );
}
