"use client";

import { PixelatedHammer } from "./PixelatedHammer";

interface PixelatedLoaderProps {
  size?: "sm" | "md" | "lg";
  text?: string;
  className?: string;
}

export function PixelatedLoader({ size = "md", text, className = "" }: PixelatedLoaderProps) {
  const textSizeClasses = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg"
  };

  return (
    <div className={`flex flex-col items-center justify-center gap-6 ${className}`}>
      {/* Animated Hammer */}
      <PixelatedHammer size={size} animated={true} />
      
      {/* Loading Text */}
      {text && (
        <div className={`text-yellow-400 font-mono ${textSizeClasses[size]} animate-pulse`}>
          {text}
        </div>
      )}

      {/* Justice-themed Loading Bar */}
      <div className="w-48 h-3 bg-black/30 border border-yellow-400/30 rounded-full overflow-hidden">
        <div className="h-full bg-gradient-to-r from-yellow-400 to-red-500 rounded-full animate-pulse"></div>
      </div>
    </div>
  );
}

// Full Screen Loading Component
export function FullScreenLoader({ text = "Loading..." }: { text?: string }) {
  return (
    <div className="fixed inset-0 bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center z-50">
      <div className="text-center">
        <PixelatedLoader size="lg" text={text} />
        <div className="mt-8 text-yellow-300 font-mono text-sm">
          ⚖️ Preparing for trial by code...
        </div>
      </div>
    </div>
  );
}

// Inline Loading Component
export function InlineLoader({ text, className }: { text?: string; className?: string }) {
  return (
    <div className={`flex items-center justify-center p-8 ${className}`}>
      <PixelatedLoader size="md" text={text} />
    </div>
  );
}

// Card Loading Skeleton
export function CardSkeleton({ className = "" }: { className?: string }) {
  return (
    <div className={`bg-black/40 backdrop-blur-sm border-cyan-400/20 rounded-lg p-6 animate-pulse ${className}`}>
      <div className="flex items-center gap-3 mb-4">
        <div className="w-8 h-8 bg-yellow-400/30 rounded-full"></div>
        <div className="h-4 bg-yellow-400/30 rounded w-32"></div>
      </div>
      <div className="space-y-3">
        <div className="h-3 bg-cyan-400/30 rounded w-full"></div>
        <div className="h-3 bg-cyan-400/30 rounded w-3/4"></div>
        <div className="h-3 bg-cyan-400/30 rounded w-1/2"></div>
      </div>
      <div className="mt-4 flex gap-2">
        <div className="h-6 bg-pink-400/30 rounded w-16"></div>
        <div className="h-6 bg-blue-400/30 rounded w-20"></div>
      </div>
    </div>
  );
}

// Grid Loading Skeleton
export function GridSkeleton({ count = 3, className = "" }: { count?: number; className?: string }) {
  return (
    <div className={`grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 ${className}`}>
      {Array.from({ length: count }).map((_, index) => (
        <CardSkeleton key={index} />
      ))}
    </div>
  );
}
