"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import type { Id } from "@/convex/_generated/dataModel";
import { getErrorMessage } from "@/lib/errorMessage";
import { ImagePicker } from "./ImagePicker";
import { StoredImage } from "./StoredImage";
import { useImageUpload } from "./useImageUpload";

const COVER_SIZES = "(max-width: 768px) 100vw, 768px";

export function CoverImageField({
  editing,
  coverImageId,
  onChange,
}: {
  editing: boolean;
  coverImageId?: Id<"_storage">;
  onChange: (coverImageId: Id<"_storage"> | undefined) => void;
}) {
  const upload = useImageUpload();
  const [uploading, setUploading] = useState(false);

  if (!editing) {
    return coverImageId ? (
      <StoredImage storageId={coverImageId} alt="" sizes={COVER_SIZES} />
    ) : null;
  }

  const pick = async (file: File) => {
    setUploading(true);
    try {
      onChange(await upload(file));
    } catch (error) {
      toast.error(
        getErrorMessage(error, "Could not upload the image. Please try again."),
      );
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-gray-200">Cover image</p>
      {coverImageId ? (
        <StoredImage storageId={coverImageId} alt="" sizes={COVER_SIZES} />
      ) : (
        <p className="text-sm text-gray-400">
          Shown on the gallery and the leaderboard.
        </p>
      )}
      <div className="flex flex-wrap gap-2">
        <ImagePicker
          label={
            uploading
              ? "Uploading…"
              : coverImageId
                ? "Replace cover image"
                : "Add a cover image"
          }
          disabled={uploading}
          onPick={(file) => void pick(file)}
          className="border-cyan-400/40 bg-transparent text-cyan-200 hover:bg-cyan-400/10 hover:text-cyan-100"
        />
        {coverImageId && (
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={uploading}
            onClick={() => onChange(undefined)}
            className="border-gray-500 bg-transparent text-gray-100 hover:bg-white/10 hover:text-white"
          >
            Remove cover image
          </Button>
        )}
      </div>
    </div>
  );
}
