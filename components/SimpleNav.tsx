"use client";

import Link from "next/link";

export function SimpleNav() {
  return (
    <nav className="flex items-center justify-between p-3 sm:p-4 bg-black/20 backdrop-blur-sm border-b border-cyan-400/20">
      <div className="flex items-center gap-2 sm:gap-4">
        <Link href="/" className="text-lg sm:text-2xl font-bold text-yellow-400 font-mono">
          🚀 Hackathon 2025
        </Link>
      </div>
      
      <div className="flex items-center gap-2 sm:gap-4">
        <Link href="/" className="text-cyan-300 hover:text-yellow-400 transition-colors font-mono text-xs sm:text-sm px-2 py-1 sm:px-3 sm:py-2 rounded-md hover:bg-yellow-400/10">
          Home
        </Link>
      </div>
    </nav>
  );
}
