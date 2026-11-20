import Image from "next/image";
import { cn } from "@/lib/utils";

type CoverProps = {
  url: string | null;
  title: string;
  sizes: string;
  className?: string;
};

// next/image so viewers hit Vercel's image cache, not Convex egress.
export function Cover({ url, title, sizes, className }: CoverProps) {
  if (url) {
    return (
      <div className={cn("relative aspect-video w-full", className)}>
        <Image src={url} alt="" fill sizes={sizes} className="object-cover" />
      </div>
    );
  }
  return (
    <div
      aria-hidden
      className={cn(
        "aspect-video w-full flex items-center justify-center bg-linear-to-br from-cyan-500/30 via-purple-600/30 to-pink-500/30",
        className,
      )}
    >
      <span className="text-5xl font-bold font-mono text-white/70">
        {title.trim().charAt(0).toUpperCase() || "?"}
      </span>
    </div>
  );
}
