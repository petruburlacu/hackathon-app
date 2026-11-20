import { cn } from "@/lib/utils";

type CoverProps = {
  url: string | null;
  title: string;
  className?: string;
};

export function Cover({ url, title, className }: CoverProps) {
  if (url) {
    return (
      // Plain <img> until covers move to next/image with Convex remotePatterns.
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={url}
        alt=""
        loading="lazy"
        className={cn("aspect-video w-full object-cover", className)}
      />
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
