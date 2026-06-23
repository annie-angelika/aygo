"use client";

import { useState } from "react";
import Image from "next/image";
import { LuLoaderCircle } from "react-icons/lu";

import { cn } from "@/lib/utils";

/**
 * The artwork inside an aygo disc: the optimized image with a spinner while it
 * loads, then a gentle fade-in. Falls back to `fallback` (the category mark)
 * when there's no image or it fails to load. Fills its relative, sized parent.
 */
export function AygoArt({
  image,
  blurDataURL,
  alt,
  sizes,
  quality,
  fallback,
  spinnerClassName,
}: {
  image?: string;
  blurDataURL?: string;
  alt: string;
  sizes: string;
  quality?: number;
  fallback: React.ReactNode;
  spinnerClassName?: string;
}) {
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);

  if (!image || failed) return <>{fallback}</>;

  return (
    <>
      <Image
        src={image}
        alt={alt}
        fill
        sizes={sizes}
        quality={quality}
        placeholder={blurDataURL ? "blur" : "empty"}
        blurDataURL={blurDataURL}
        onLoad={() => setLoaded(true)}
        onError={() => setFailed(true)}
        className={cn(
          "object-cover transition-opacity duration-300",
          loaded ? "opacity-100" : "opacity-0",
        )}
      />
      {!loaded && (
        <span className="absolute inset-0 grid place-items-center bg-card">
          <LuLoaderCircle
            className={cn(
              "size-5 animate-spin text-muted-foreground/50 motion-reduce:animate-none",
              spinnerClassName,
            )}
            aria-hidden
          />
        </span>
      )}
    </>
  );
}
