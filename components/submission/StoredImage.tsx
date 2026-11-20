"use client";

import { useQuery } from "convex/react";
import Image from "next/image";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";

// Renders through next/image so viewers hit Vercel's image cache, not Convex egress.
export function StoredImage({
  storageId,
  alt,
  sizes,
  className,
}: {
  storageId: Id<"_storage">;
  alt: string;
  sizes: string;
  className?: string;
}) {
  const urls = useQuery(api.images.getImageUrls, { storageIds: [storageId] });
  const url = urls?.[storageId];

  if (urls === undefined) {
    return (
      <div
        aria-hidden
        className={`aspect-video w-full animate-pulse rounded-md bg-white/5 ${className ?? ""}`}
      />
    );
  }
  if (!url) {
    return (
      <div
        className={`flex aspect-video w-full items-center justify-center rounded-md border border-dashed border-gray-600 text-sm text-gray-400 ${className ?? ""}`}
      >
        Image unavailable
      </div>
    );
  }
  return (
    <Image
      src={url}
      alt={alt}
      width={0}
      height={0}
      sizes={sizes}
      className={`h-auto w-full rounded-md ${className ?? ""}`}
    />
  );
}
