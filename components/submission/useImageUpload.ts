"use client";

import { useMutation } from "convex/react";
import { ConvexError } from "convex/values";
import { useCallback } from "react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { compressImage } from "@/lib/compressImage";

export function useImageUpload(): (file: File) => Promise<Id<"_storage">> {
  const generateUploadUrl = useMutation(api.images.generateUploadUrl);
  const registerUpload = useMutation(api.images.registerUpload);

  return useCallback(
    async (file: File) => {
      const blob = await compressImage(file);
      const url = await generateUploadUrl({});
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": blob.type },
        body: blob,
      });
      if (!response.ok) {
        throw new ConvexError("Upload failed. Please try again.");
      }
      const { storageId } = (await response.json()) as {
        storageId: Id<"_storage">;
      };
      const result = await registerUpload({ storageId });
      if ("error" in result) {
        throw new ConvexError(result.error);
      }
      return result.storageId;
    },
    [generateUploadUrl, registerUpload],
  );
}
