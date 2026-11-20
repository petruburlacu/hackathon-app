import { ConvexError } from "convex/values";

export const MAX_EDGE_PX = 1600;
export const MAX_ORIGINAL_BYTES = 15 * 1024 * 1024;
const QUALITY = 0.8;

// Scales so the long edge is at most maxEdge, keeping the aspect ratio. Never upscales.
export function fitWithin(
  width: number,
  height: number,
  maxEdge: number,
): { width: number; height: number } {
  const scale = Math.min(1, maxEdge / Math.max(width, height));
  return {
    width: Math.max(1, Math.round(width * scale)),
    height: Math.max(1, Math.round(height * scale)),
  };
}

function encode(canvas: HTMLCanvasElement, type: string): Promise<Blob | null> {
  return new Promise((resolve) => canvas.toBlob(resolve, type, QUALITY));
}

// Throws ConvexError so callers show the message with the same getErrorMessage as server errors.
export async function compressImage(file: File): Promise<Blob> {
  if (!file.type.startsWith("image/")) {
    throw new ConvexError("Not an image");
  }
  if (file.size > MAX_ORIGINAL_BYTES) {
    throw new ConvexError("Image is over 15 MB");
  }
  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    throw new ConvexError("Not an image");
  }
  const { width, height } = fitWithin(bitmap.width, bitmap.height, MAX_EDGE_PX);
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  canvas.getContext("2d")?.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();
  // Browsers that can't encode WebP silently return PNG, which is far bigger; JPEG is the fallback.
  const webp = await encode(canvas, "image/webp");
  const blob =
    webp?.type === "image/webp" ? webp : await encode(canvas, "image/jpeg");
  if (!blob) {
    throw new ConvexError("Could not compress this image");
  }
  return blob;
}
