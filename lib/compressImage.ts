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

function readDimensions(
  file: File,
): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("decode failed"));
    };
    img.src = url;
  });
}

// Decoding at the target size keeps a huge photo from being held in memory at full resolution.
// Browsers that don't support the resize options throw or ignore them; drawImage scales either way.
async function decodeAt(
  file: File,
  width: number,
  height: number,
): Promise<ImageBitmap> {
  try {
    return await createImageBitmap(file, {
      resizeWidth: width,
      resizeHeight: height,
      resizeQuality: "high",
    });
  } catch {
    return await createImageBitmap(file);
  }
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
  let width: number;
  let height: number;
  try {
    const original = await readDimensions(file);
    ({ width, height } = fitWithin(
      original.width,
      original.height,
      MAX_EDGE_PX,
    ));
    bitmap = await decodeAt(file, width, height);
  } catch {
    throw new ConvexError("Not an image");
  }
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  if (!context) {
    bitmap.close();
    throw new ConvexError("Could not compress this image");
  }
  context.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();
  // Browsers that can't encode WebP silently return PNG, which is far bigger; JPEG is the fallback.
  const webp = await encode(canvas, "image/webp");
  if (webp?.type === "image/webp") {
    return webp;
  }
  // JPEG has no alpha: paint white behind the image so transparent areas don't turn black.
  context.globalCompositeOperation = "destination-over";
  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, width, height);
  const jpeg = await encode(canvas, "image/jpeg");
  if (!jpeg) {
    throw new ConvexError("Could not compress this image");
  }
  return jpeg;
}
