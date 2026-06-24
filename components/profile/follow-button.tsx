"use client";

import { useState } from "react";
import { LuCheck, LuPlus } from "react-icons/lu";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";

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
      className="h-9 w-full rounded-full"
    >
      {following ? (
        <>
          <LuCheck className="size-4" />
          Following
        </>
      ) : (
        <>
          <LuPlus className="size-4" />
          Follow
        </>
      )}
    </Button>
  );
}
