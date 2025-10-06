"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

export function SimpleNav() {
  return (
    <nav className="flex items-center justify-between p-4 bg-black/20 backdrop-blur-sm border-b border-cyan-400/20">
      <div className="flex items-center gap-4">
        <Link href="/" className="text-2xl font-bold text-yellow-400 font-mono">
          🚀 Hackathon 2025
        </Link>
      </div>
      
      <div className="flex items-center gap-4">
        <Link href="/" className="text-cyan-300 hover:text-yellow-400 transition-colors font-mono text-sm">
          Home
        </Link>
        <Link href="/#about" className="text-cyan-300 hover:text-yellow-400 transition-colors font-mono text-sm">
          About
        </Link>
      </div>
    </nav>
  );
}
